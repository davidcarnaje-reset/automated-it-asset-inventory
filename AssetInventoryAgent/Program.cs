using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Management;
using System.Net.Http;
using System.Net.Http.Json;
using System.Runtime.Versioning;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace AssetInventoryAgent;

[SupportedOSPlatform("windows")]
internal static class Program
{
    [STAThread]
    static void Main()
    {
        ApplicationConfiguration.Initialize();
        Application.Run(new MainForm());
    }
}

[SupportedOSPlatform("windows")]
public class MainForm : Form
{
    private TextBox txtServerUrl = null!;
    private Button btnScan = null!;
    private Label lblStatus = null!;
    private RichTextBox txtLogs = null!;
    private static readonly HttpClient _httpClient = new HttpClient();

    public MainForm()
    {
        InitializeComponent();
    }

    private void InitializeComponent()
    {
        this.Text = "IT Asset Inventory Agent";
        this.Size = new Size(600, 520);
        this.MinimumSize = new Size(500, 420);
        this.StartPosition = FormStartPosition.CenterScreen;
        this.BackColor = Color.FromArgb(240, 244, 248);
        this.Font = new Font("Segoe UI", 9.5F, FontStyle.Regular, GraphicsUnit.Point);

        // Header Panel (Sleek Dark Gray styling)
        Panel headerPanel = new Panel
        {
            Dock = DockStyle.Top,
            Height = 60,
            BackColor = Color.FromArgb(31, 41, 55)
        };

        Label titleLabel = new Label
        {
            Text = "AUTOMATED IT ASSET INVENTORY",
            ForeColor = Color.White,
            Font = new Font("Segoe UI", 12F, FontStyle.Bold),
            Dock = DockStyle.Fill,
            TextAlign = ContentAlignment.MiddleCenter
        };
        headerPanel.Controls.Add(titleLabel);

        // Control Panel
        Panel controlPanel = new Panel
        {
            Dock = DockStyle.Top,
            Height = 120,
            Padding = new Padding(15)
        };

        Label lblServer = new Label
        {
            Text = "API Server Endpoint:",
            ForeColor = Color.FromArgb(55, 65, 81),
            Font = new Font("Segoe UI", 9.5F, FontStyle.Bold),
            Location = new Point(15, 20),
            AutoSize = true
        };

        txtServerUrl = new TextBox
        {
            Text = "http://localhost:5067",
            Font = new Font("Segoe UI", 10F),
            Location = new Point(160, 17),
            Width = 405,
            ForeColor = Color.FromArgb(17, 24, 39)
        };

        btnScan = new Button
        {
            Text = "Scan & Submit System Info",
            BackColor = Color.FromArgb(37, 99, 235),
            ForeColor = Color.White,
            FlatStyle = FlatStyle.Flat,
            Font = new Font("Segoe UI", 10F, FontStyle.Bold),
            Location = new Point(15, 60),
            Width = 240,
            Height = 40,
            Cursor = Cursors.Hand
        };
        btnScan.FlatAppearance.BorderSize = 0;
        btnScan.Click += BtnScan_Click;

        lblStatus = new Label
        {
            Text = "Status: Ready",
            ForeColor = Color.FromArgb(55, 65, 81),
            Font = new Font("Segoe UI", 11F, FontStyle.Bold),
            Location = new Point(275, 67),
            AutoSize = true
        };

        controlPanel.Controls.Add(lblServer);
        controlPanel.Controls.Add(txtServerUrl);
        controlPanel.Controls.Add(btnScan);
        controlPanel.Controls.Add(lblStatus);

        // Logs area
        txtLogs = new RichTextBox
        {
            Dock = DockStyle.Fill,
            ReadOnly = true,
            BackColor = Color.White,
            ForeColor = Color.FromArgb(17, 24, 39),
            Font = new Font("Consolas", 10F),
            BorderStyle = BorderStyle.None
        };

        Panel logContainer = new Panel
        {
            Dock = DockStyle.Fill,
            Padding = new Padding(15, 0, 15, 15),
            BackColor = Color.FromArgb(240, 244, 248)
        };
        
        Panel innerLogBorder = new Panel
        {
            Dock = DockStyle.Fill,
            BackColor = Color.White,
            Padding = new Padding(5)
        };
        innerLogBorder.Controls.Add(txtLogs);
        logContainer.Controls.Add(innerLogBorder);

        this.Controls.Add(logContainer);
        this.Controls.Add(controlPanel);
        this.Controls.Add(headerPanel);
    }

    private void Log(string message)
    {
        if (txtLogs.InvokeRequired)
        {
            txtLogs.Invoke(new Action(() => Log(message)));
            return;
        }
        txtLogs.AppendText(message + Environment.NewLine);
        txtLogs.SelectionStart = txtLogs.Text.Length;
        txtLogs.ScrollToCaret();
    }

    private async void BtnScan_Click(object? sender, EventArgs e)
    {
        string serverUrl = txtServerUrl.Text.Trim();
        if (string.IsNullOrEmpty(serverUrl))
        {
            MessageBox.Show("Please provide a valid API Server URL.", "Validation Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            lblStatus.Text = "Status: Invalid URL";
            lblStatus.ForeColor = Color.FromArgb(220, 38, 38);
            return;
        }

        btnScan.Enabled = false;
        txtServerUrl.Enabled = false;
        lblStatus.Text = "Status: Scanning...";
        lblStatus.ForeColor = Color.FromArgb(217, 119, 6); // Amber
        txtLogs.Clear();

        Log("==================================================");
        Log(" IT Asset Inventory Agent - Starting Extraction");
        Log("==================================================");

        try
        {
            var payload = await Task.Run(() => ExtractInventory());
            
            PrintPayloadToLogs(payload);

            var success = await SubmitInventoryAsync(serverUrl, payload);
            if (success)
            {
                lblStatus.Text = "Status: Successfully Submitted!";
                lblStatus.ForeColor = Color.FromArgb(22, 163, 74); // Green
            }
            else
            {
                lblStatus.Text = "Status: Submission Failed!";
                lblStatus.ForeColor = Color.FromArgb(220, 38, 38); // Red
            }
        }
        catch (Exception ex)
        {
            Log($"[ERROR] Critical failure in agent execution: {ex.Message}");
            lblStatus.Text = "Status: Scan Error!";
            lblStatus.ForeColor = Color.FromArgb(220, 38, 38); // Red
        }
        finally
        {
            btnScan.Enabled = true;
            txtServerUrl.Enabled = true;
        }
    }

    private InventorySubmissionDto ExtractInventory()
    {
        var dto = new InventorySubmissionDto();

        // 1. Hostname
        dto.Hostname = Environment.MachineName;
        Log($"[INFO] Extracted Hostname: {dto.Hostname}");

        // 2. Clean Logged In User (Just UserName, no Domain prefix)
        dto.LoggedInUser = Environment.UserName;
        Log($"[INFO] Extracted Logged In User: {dto.LoggedInUser}");

        // 3. IP & MAC Address (Win32_NetworkAdapterConfiguration where IPEnabled = true)
        using (var searcher = new ManagementObjectSearcher("SELECT IPAddress, MACAddress FROM Win32_NetworkAdapterConfiguration WHERE IPEnabled = True"))
        {
            foreach (ManagementObject obj in searcher.Get())
            {
                var ipAddresses = obj["IPAddress"] as string[];
                var macAddress = obj["MACAddress"] as string;

                if (ipAddresses != null && ipAddresses.Length > 0 && !string.IsNullOrEmpty(macAddress))
                {
                    var ipv4 = ipAddresses.FirstOrDefault(ip => !ip.Contains(":"));
                    if (ipv4 != null)
                    {
                        dto.IPAddress = ipv4;
                        dto.MACAddress = macAddress;
                        Log($"[INFO] Extracted Active Network: IP = {dto.IPAddress}, MAC = {dto.MACAddress}");
                        break;
                    }
                }
            }
        }

        // 4. CPU (Win32_Processor)
        using (var searcher = new ManagementObjectSearcher("SELECT Name FROM Win32_Processor"))
        {
            foreach (ManagementObject obj in searcher.Get())
            {
                dto.CPU = obj["Name"]?.ToString()?.Trim();
                Log($"[INFO] Extracted CPU: {dto.CPU}");
                break;
            }
        }

        // 5. RAM (Win32_ComputerSystem)
        using (var searcher = new ManagementObjectSearcher("SELECT TotalPhysicalMemory FROM Win32_ComputerSystem"))
        {
            foreach (ManagementObject obj in searcher.Get())
            {
                var memoryVal = obj["TotalPhysicalMemory"];
                if (memoryVal != null)
                {
                    double bytes = Convert.ToDouble(memoryVal);
                    double gb = bytes / (1024.0 * 1024.0 * 1024.0);
                    dto.RAM = $"{Math.Round(gb)} GB";
                    Log($"[INFO] Extracted RAM: {dto.RAM}");
                }
                break;
            }
        }

        // 6. Storage (Win32_DiskDrive)
        var diskSummaries = new List<string>();
        using (var searcher = new ManagementObjectSearcher("SELECT Model, Size FROM Win32_DiskDrive"))
        {
            foreach (ManagementObject obj in searcher.Get())
            {
                var model = obj["Model"]?.ToString()?.Trim();
                var sizeVal = obj["Size"];
                if (!string.IsNullOrEmpty(model) && sizeVal != null)
                {
                    double bytes = Convert.ToDouble(sizeVal);
                    double gb = bytes / (1024.0 * 1024.0 * 1024.0);
                    diskSummaries.Add($"{model} ({Math.Round(gb)} GB)");
                }
            }
        }
        dto.Storage = diskSummaries.Count > 0 ? string.Join(", ", diskSummaries) : "Unknown Storage";
        Log($"[INFO] Extracted Storage: {dto.Storage}");

        // 7. Serial Number (Win32_Bios)
        using (var searcher = new ManagementObjectSearcher("SELECT SerialNumber FROM Win32_Bios"))
        {
            foreach (ManagementObject obj in searcher.Get())
            {
                dto.SerialNumber = obj["SerialNumber"]?.ToString()?.Trim();
                Log($"[INFO] Extracted Serial Number: {dto.SerialNumber}");
                break;
            }
        }

        // 8. OS Version (Win32_OperatingSystem)
        using (var searcher = new ManagementObjectSearcher("SELECT Caption FROM Win32_OperatingSystem"))
        {
            foreach (ManagementObject obj in searcher.Get())
            {
                dto.OSVersion = obj["Caption"]?.ToString()?.Trim();
                Log($"[INFO] Extracted OS Version: {dto.OSVersion}");
                break;
            }
        }

        // 9. Peripherals Scanning & De-duplication
        dto.Peripherals = new List<PeripheralSubmissionDto>();
        var uniquePeripherals = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        // A. Monitor Detection (Query display monitors via Win32_PnPEntity, fallback to Win32_DesktopMonitor)
        int monitorCount = 0;
        try
        {
            using (var searcher = new ManagementObjectSearcher("SELECT Name, Manufacturer FROM Win32_PnPEntity WHERE PNPDeviceID LIKE 'DISPLAY\\\\%' AND Status = 'OK'"))
            {
                foreach (ManagementObject obj in searcher.Get())
                {
                    var name = obj["Name"]?.ToString()?.Trim();
                    var manufacturer = obj["Manufacturer"]?.ToString()?.Trim();

                    if (!string.IsNullOrEmpty(name) && uniquePeripherals.Add(name))
                    {
                        var pDto = new PeripheralSubmissionDto
                        {
                            DeviceName = name,
                            DeviceType = "Monitor",
                            Manufacturer = string.IsNullOrEmpty(manufacturer) || IsGenericManufacturer(manufacturer) ? "Generic Monitor" : manufacturer
                        };
                        dto.Peripherals.Add(pDto);
                        monitorCount++;
                        Log($"[INFO] Extracted Monitor: {name} ({pDto.Manufacturer})");
                    }
                }
            }

            if (monitorCount == 0)
            {
                using (var searcher = new ManagementObjectSearcher("SELECT Name, MonitorManufacturer FROM Win32_DesktopMonitor"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        var name = obj["Name"]?.ToString()?.Trim();
                        var manufacturer = obj["MonitorManufacturer"]?.ToString()?.Trim();

                        if (!string.IsNullOrEmpty(name) && !name.Contains("Default", StringComparison.OrdinalIgnoreCase) && uniquePeripherals.Add(name))
                        {
                            var pDto = new PeripheralSubmissionDto
                            {
                                DeviceName = name,
                                DeviceType = "Monitor",
                                Manufacturer = string.IsNullOrEmpty(manufacturer) || IsGenericManufacturer(manufacturer) ? "Generic Monitor" : manufacturer
                            };
                            dto.Peripherals.Add(pDto);
                            Log($"[INFO] Extracted Monitor (Fallback): {name} ({pDto.Manufacturer})");
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Log($"[WARNING] Failed to query Display Monitor details: {ex.Message}");
        }

        // B. Keyboards, Mice & General USB Peripherals (including USBSTOR storage flash drives)
        try
        {
            using (var searcher = new ManagementObjectSearcher(
                "SELECT Name, Manufacturer, Description, Caption, Service FROM Win32_PnPEntity " +
                "WHERE (PNPDeviceID LIKE 'USB\\\\%' OR PNPDeviceID LIKE 'USBSTOR\\\\%' OR Service = 'kbdclass' OR Service = 'mouclass') AND Status = 'OK'"))
            {
                foreach (ManagementObject obj in searcher.Get())
                {
                    var name = obj["Name"]?.ToString()?.Trim();
                    var manufacturer = obj["Manufacturer"]?.ToString()?.Trim();
                    var description = obj["Description"]?.ToString()?.Trim();
                    var caption = obj["Caption"]?.ToString()?.Trim();
                    var service = obj["Service"]?.ToString()?.Trim();

                    // Skip empty names or standard hub/controller nodes
                    if (string.IsNullOrEmpty(name) || IsGenericUsbComponent(name))
                        continue;

                    // Skip devices with completely empty manufacturers
                    if (string.IsNullOrEmpty(manufacturer))
                        continue;

                    // Handle generic keyboard/mouse re-mapping to improve clarity
                    string finalName = name;
                    if (name.Equals("USB Input Device", StringComparison.OrdinalIgnoreCase))
                    {
                        if (service?.Equals("kbdclass", StringComparison.OrdinalIgnoreCase) == true)
                            finalName = "USB Keyboard";
                        else if (service?.Equals("mouclass", StringComparison.OrdinalIgnoreCase) == true)
                            finalName = "USB Mouse";
                    }

                    // Avoid hardcoding Generic or Standard if a more specific description exists
                    string finalManufacturer = manufacturer;
                    if (IsGenericManufacturer(manufacturer))
                    {
                        if (!string.IsNullOrEmpty(description) && !IsGenericManufacturer(description))
                            finalManufacturer = description;
                        else if (!string.IsNullOrEmpty(caption) && !IsGenericManufacturer(caption))
                            finalManufacturer = caption;
                    }

                    if (IsGenericManufacturer(finalManufacturer))
                    {
                        finalManufacturer = "Generic";
                    }

                    if (uniquePeripherals.Add(finalName))
                    {
                        var pDto = new PeripheralSubmissionDto
                        {
                            DeviceName = finalName,
                            DeviceType = InferDeviceType(finalName, service),
                            Manufacturer = finalManufacturer
                        };
                        dto.Peripherals.Add(pDto);
                        Log($"[INFO] Extracted Peripheral: {finalName} (Type: {pDto.DeviceType}, Manufacturer: {pDto.Manufacturer})");

                        if (dto.Peripherals.Count >= 10)
                            break;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Log($"[WARNING] Failed to query USB peripherals: {ex.Message}");
        }

        Log($"[INFO] Extracted {dto.Peripherals.Count} connected USB peripherals & display devices.");
        return dto;
    }

    private bool IsGenericUsbComponent(string name)
    {
        var lower = name.ToLowerInvariant();
        return lower.Contains("usb root hub") ||
               lower.Contains("usb host controller") ||
               lower.Contains("usb composite device") ||
               lower.Contains("generic usb hub") ||
               lower.Contains("usb mass storage device") ||
               lower.Contains("usb loopback") ||
               lower.Contains("virtual usb") ||
               lower.Contains("root hub");
    }

    private bool IsGenericManufacturer(string value)
    {
        if (string.IsNullOrEmpty(value)) return true;
        var lower = value.ToLowerInvariant();
        return lower.Contains("standard") || 
               lower.Contains("generic") || 
               lower.Contains("microsoft") || 
               lower.Contains("default") ||
               lower.StartsWith("(") && lower.EndsWith(")");
    }

    private string InferDeviceType(string deviceName, string? service)
    {
        if (service?.Equals("kbdclass", StringComparison.OrdinalIgnoreCase) == true) return "Keyboard";
        if (service?.Equals("mouclass", StringComparison.OrdinalIgnoreCase) == true) return "Mouse";

        var name = deviceName.ToLowerInvariant();
        if (name.Contains("mouse") || name.Contains("pointing")) return "Mouse";
        if (name.Contains("keyboard") || name.Contains("keypad")) return "Keyboard";
        if (name.Contains("audio") || name.Contains("headset") || name.Contains("speaker") || name.Contains("microphone") || name.Contains("headphone")) return "Audio Device";
        if (name.Contains("camera") || name.Contains("webcam") || name.Contains("video")) return "Camera";
        if (name.Contains("storage") || name.Contains("drive") || name.Contains("mass storage") || name.Contains("flash") || name.Contains("disk")) return "Storage Device";
        if (name.Contains("print") || name.Contains("laserjet") || name.Contains("inkjet")) return "Printer";
        if (name.Contains("monitor") || name.Contains("display")) return "Monitor";
        return "USB Peripheral";
    }

    private void PrintPayloadToLogs(InventorySubmissionDto payload)
    {
        Log("");
        Log("==================================================");
        Log(" PREPARED INVENTORY PAYLOAD:");
        Log("==================================================");
        Log($" Hostname:       {payload.Hostname}");
        Log($" Logged In User: {payload.LoggedInUser}");
        Log($" IP Address:     {payload.IPAddress}");
        Log($" MAC Address:    {payload.MACAddress}");
        Log($" Serial Number:  {payload.SerialNumber}");
        Log($" CPU:            {payload.CPU}");
        Log($" RAM:            {payload.RAM}");
        Log($" Storage:        {payload.Storage}");
        Log($" OS Version:     {payload.OSVersion}");
        Log(" Connected Peripherals:");
        foreach (var p in payload.Peripherals)
        {
            Log($"   - {p.DeviceName} (Type: {p.DeviceType}, Manufacturer: {p.Manufacturer})");
        }
        Log("==================================================");
        Log("");
    }

    private async Task<bool> SubmitInventoryAsync(string baseUrl, InventorySubmissionDto payload)
    {
        string apiUri = baseUrl;
        if (!apiUri.EndsWith("/api/inventory", StringComparison.OrdinalIgnoreCase))
        {
            apiUri = apiUri.TrimEnd('/') + "/api/inventory";
        }

        const int maxRetries = 3;
        const int delayMilliseconds = 3000;

        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            Log($"[SEND] Submitting inventory to API: {apiUri} (Attempt {attempt} of {maxRetries})...");
            try
            {
                var response = await _httpClient.PostAsJsonAsync(apiUri, payload);
                if (response.IsSuccessStatusCode)
                {
                    Log("[SUCCESS] Inventory successfully submitted to Server!");
                    return true;
                }
                else
                {
                    Log($"[WARNING] Server returned status code {response.StatusCode}");
                }
            }
            catch (HttpRequestException ex)
            {
                Log($"[WARNING] Connection to server failed: {ex.Message}");
            }

            if (attempt < maxRetries)
            {
                Log($"[RETRY] Waiting {delayMilliseconds / 1000} seconds before retrying...");
                await Task.Delay(delayMilliseconds);
            }
        }

        Log("[ERROR] Failed to submit inventory to the server after maximum retries.");
        return false;
    }
}

public class InventorySubmissionDto
{
    public string Hostname { get; set; } = string.Empty;
    public string? LoggedInUser { get; set; }
    public string IPAddress { get; set; } = string.Empty;
    public string MACAddress { get; set; } = string.Empty;
    public string? SerialNumber { get; set; }
    public string? CPU { get; set; }
    public string? RAM { get; set; }
    public string? Storage { get; set; }
    public string? OSVersion { get; set; }
    public List<PeripheralSubmissionDto> Peripherals { get; set; } = new();
}

public class PeripheralSubmissionDto
{
    public string DeviceName { get; set; } = string.Empty;
    public string? DeviceType { get; set; }
    public string? Manufacturer { get; set; }
}
