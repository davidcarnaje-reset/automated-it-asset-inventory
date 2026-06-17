using System;
using System.Drawing;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using AssetInventoryAPI.Data;

namespace AssetInventoryAPI;

[System.Runtime.Versioning.SupportedOSPlatform("windows")]
internal static class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        ApplicationConfiguration.Initialize();
        Application.Run(new DashboardForm(args));
    }
}

[System.Runtime.Versioning.SupportedOSPlatform("windows")]
public class DashboardForm : Form
{
    private readonly string[] _args;
    private IHost? _host;
    
    private Label lblStatus = null!;
    private Button btnStart = null!;
    private Button btnStop = null!;
    private NotifyIcon trayIcon = null!;
    private ContextMenuStrip trayMenu = null!;

    public DashboardForm(string[] args)
    {
        _args = args;
        InitializeComponent();
        SetupSystemTray();
    }

    private void InitializeComponent()
    {
        this.Text = "IT Asset Inventory API Server Dashboard";
        this.Size = new Size(500, 320);
        this.MinimumSize = new Size(400, 260);
        this.StartPosition = FormStartPosition.CenterScreen;
        this.BackColor = Color.FromArgb(243, 244, 246);
        this.Font = new Font("Segoe UI", 9.5F, FontStyle.Regular, GraphicsUnit.Point);
        this.FormBorderStyle = FormBorderStyle.FixedSingle;
        this.MaximizeBox = false;

        // Header Panel
        Panel headerPanel = new Panel
        {
            Dock = DockStyle.Top,
            Height = 65,
            BackColor = Color.FromArgb(37, 99, 235) // Elegant Blue
        };

        Label titleLabel = new Label
        {
            Text = "IT ASSET INVENTORY API SERVER",
            ForeColor = Color.White,
            Font = new Font("Segoe UI", 12F, FontStyle.Bold),
            Dock = DockStyle.Fill,
            TextAlign = ContentAlignment.MiddleCenter
        };
        headerPanel.Controls.Add(titleLabel);

        // Status Container
        Panel statusPanel = new Panel
        {
            Location = new Point(25, 90),
            Size = new Size(450, 70),
            BackColor = Color.White,
            BorderStyle = BorderStyle.None
        };
        statusPanel.Padding = new Padding(10);

        lblStatus = new Label
        {
            Text = "API Server: Stopped",
            ForeColor = Color.FromArgb(220, 38, 38), // Red
            Font = new Font("Segoe UI", 11F, FontStyle.Bold),
            Dock = DockStyle.Fill,
            TextAlign = ContentAlignment.MiddleCenter
        };
        statusPanel.Controls.Add(lblStatus);

        // Buttons Panel
        btnStart = new Button
        {
            Text = "Start Server",
            BackColor = Color.FromArgb(22, 163, 74), // Green
            ForeColor = Color.White,
            FlatStyle = FlatStyle.Flat,
            Font = new Font("Segoe UI", 10F, FontStyle.Bold),
            Location = new Point(25, 180),
            Size = new Size(210, 45),
            Cursor = Cursors.Hand
        };
        btnStart.FlatAppearance.BorderSize = 0;
        btnStart.Click += BtnStart_Click;

        btnStop = new Button
        {
            Text = "Stop Server",
            BackColor = Color.FromArgb(220, 38, 38), // Red
            ForeColor = Color.White,
            FlatStyle = FlatStyle.Flat,
            Font = new Font("Segoe UI", 10F, FontStyle.Bold),
            Location = new Point(265, 180),
            Size = new Size(210, 45),
            Cursor = Cursors.Hand,
            Enabled = false
        };
        btnStop.FlatAppearance.BorderSize = 0;
        btnStop.Click += BtnStop_Click;

        // Footer instructions
        Label lblInfo = new Label
        {
            Text = "Minimize this dashboard to run silently in the system tray.",
            ForeColor = Color.FromArgb(107, 114, 128),
            Font = new Font("Segoe UI", 8F, FontStyle.Italic),
            Location = new Point(25, 240),
            Size = new Size(450, 20),
            TextAlign = ContentAlignment.MiddleCenter
        };

        this.Controls.Add(lblInfo);
        this.Controls.Add(btnStart);
        this.Controls.Add(btnStop);
        this.Controls.Add(statusPanel);
        this.Controls.Add(headerPanel);

        // Handle Minimizing to Tray
        this.Resize += DashboardForm_Resize;
        this.FormClosing += DashboardForm_FormClosing;
        this.Load += (s, e) => BtnStart_Click(null, EventArgs.Empty);
    }

    private void SetupSystemTray()
    {
        // Setup Context Menu for System Tray Icon
        trayMenu = new ContextMenuStrip();
        trayMenu.Items.Add("Restore Dashboard", null, (s, e) => RestoreWindow());
        trayMenu.Items.Add("-");
        trayMenu.Items.Add("Exit Application", null, async (s, e) => await ExitApplicationAsync());

        // Create custom 16x16 icon with 'API' text programmatically
        Icon appIcon;
        try
        {
            using var bitmap = new Bitmap(16, 16);
            using (var g = Graphics.FromImage(bitmap))
            {
                g.Clear(Color.FromArgb(37, 99, 235)); // Blue background
                using var font = new Font("Segoe UI", 7.5F, FontStyle.Bold);
                using var brush = new SolidBrush(Color.White);
                g.DrawString("API", font, brush, -1, 1);
            }
            appIcon = Icon.FromHandle(bitmap.GetHicon());
        }
        catch
        {
            appIcon = SystemIcons.Application;
        }

        trayIcon = new NotifyIcon
        {
            Text = "IT Asset Inventory API Server",
            Icon = appIcon,
            ContextMenuStrip = trayMenu,
            Visible = true
        };

        trayIcon.DoubleClick += (s, e) => RestoreWindow();
    }

    private void RestoreWindow()
    {
        this.Show();
        this.WindowState = FormWindowState.Normal;
        this.ShowInTaskbar = true;
    }

    private void DashboardForm_Resize(object? sender, EventArgs e)
    {
        if (this.WindowState == FormWindowState.Minimized)
        {
            this.Hide();
            this.ShowInTaskbar = false;
            trayIcon.ShowBalloonTip(1500, "API Server Status", "API Server is running in the system tray.", ToolTipIcon.Info);
        }
    }

    private async void DashboardForm_FormClosing(object? sender, FormClosingEventArgs e)
    {
        // Prevent close and minimize to tray if clicked by user, but let ExitApplication close it
        if (e.CloseReason == CloseReason.UserClosing)
        {
            e.Cancel = true;
            this.WindowState = FormWindowState.Minimized;
        }
        else
        {
            await CleanupServerAsync();
        }
    }

    private async Task CleanupServerAsync()
    {
        if (trayIcon != null)
        {
            trayIcon.Visible = false;
            trayIcon.Dispose();
        }
        if (_host != null)
        {
            await _host.StopAsync();
            _host.Dispose();
        }
    }

    private async Task ExitApplicationAsync()
    {
        await CleanupServerAsync();
        Environment.Exit(0);
    }

    private async void BtnStart_Click(object? sender, EventArgs e)
    {
        btnStart.Enabled = false;
        lblStatus.Text = "Starting Server...";
        lblStatus.ForeColor = Color.FromArgb(217, 119, 6); // Amber

        try
        {
            await StartApiServerAsync();
            lblStatus.Text = "API Server: Running on http://localhost:5067";
            lblStatus.ForeColor = Color.FromArgb(22, 163, 74); // Green
            btnStop.Enabled = true;
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Failed to start server: {ex.Message}", "Start Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            lblStatus.Text = "API Server: Stopped (Error)";
            lblStatus.ForeColor = Color.FromArgb(220, 38, 38); // Red
            btnStart.Enabled = true;
        }
    }

    private async void BtnStop_Click(object? sender, EventArgs e)
    {
        btnStop.Enabled = false;
        lblStatus.Text = "Stopping Server...";
        lblStatus.ForeColor = Color.FromArgb(217, 119, 6); // Amber

        try
        {
            if (_host != null)
            {
                await _host.StopAsync();
                _host.Dispose();
                _host = null;
            }
            lblStatus.Text = "API Server: Stopped";
            lblStatus.ForeColor = Color.FromArgb(220, 38, 38); // Red
            btnStart.Enabled = true;
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Failed to stop server: {ex.Message}", "Stop Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            lblStatus.Text = "API Server: Running (Error on Stop)";
            lblStatus.ForeColor = Color.FromArgb(22, 163, 74); // Green
            btnStop.Enabled = true;
        }
    }

    private async Task StartApiServerAsync()
    {
        var builder = WebApplication.CreateBuilder(_args);

        // Bind Kestrel to listen on port 5067
        builder.WebHost.UseUrls("http://localhost:5067");

        builder.Services.AddOpenApi();
        builder.Services.AddControllers();
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowNextjsFrontend", policy =>
            {
                policy.WithOrigins("http://localhost:3000")
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
        });

        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }

        app.UseHttpsRedirection();
        app.UseCors("AllowNextjsFrontend");
        app.MapControllers();

        // Support weather forecast mapping (original boilerplate mapping)
        var summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        app.MapGet("/weatherforecast", () =>
        {
            var forecast = Enumerable.Range(1, 5).Select(index =>
                new WeatherForecast
                (
                    DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                    Random.Shared.Next(-20, 55),
                    summaries[Random.Shared.Next(summaries.Length)]
                ))
                .ToArray();
            return forecast;
        })
        .WithName("GetWeatherForecast");

        _host = app;
        await _host.StartAsync();
    }
}

public record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
