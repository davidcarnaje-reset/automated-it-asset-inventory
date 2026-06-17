export interface HardwareSpecs {
  cpu: string;
  ram: string;
  storage: string;
  gpu?: string;
}

export interface Peripherals {
  monitors: string[];
  keyboards: string[];
  mice: string[];
  webcams: string[];
}

export interface Computer {
  id: string;
  hostname: string;
  ipAddress: string;
  macAddress: string;
  activeUser: string;
  osVersion: string;
  serialNumber: string;
  lastSeen: string; // ISO date string
  hardwareSpecs: HardwareSpecs;
  peripherals: Peripherals;
}

/**
 * Normalizes device data returned from the backend, handling casing variations
 * (PascalCase vs camelCase) to ensure type safety.
 */
export function normalizeComputer(raw: any): Computer {
  const getProp = (keys: string[], fallback: any) => {
    for (const key of keys) {
      if (raw[key] !== undefined && raw[key] !== null) return raw[key];
    }
    return fallback;
  };

  const hardware = raw.hardwareSpecs || raw.HardwareSpecs || {};
  const peripheralsRaw = raw.peripherals || raw.Peripherals || [];

  let monitors: string[] = [];
  let keyboards: string[] = [];
  let mice: string[] = [];
  let webcams: string[] = [];

  if (Array.isArray(peripheralsRaw)) {
    // Process EF Core flat array relation list
    for (const p of peripheralsRaw) {
      if (!p) continue;
      const name = p.deviceName || p.DeviceName || p.name || p.Name || '';
      const type = (p.deviceType || p.DeviceType || p.type || p.Type || '').toLowerCase();
      if (!name) continue;

      const manufacturer = p.manufacturer || p.Manufacturer || '';
      const dispName = manufacturer ? `${manufacturer} ${name}` : name;

      if (type === 'monitor' || type === 'display' || type === 'screen') {
        monitors.push(dispName);
      } else if (type === 'keyboard') {
        keyboards.push(dispName);
      } else if (type === 'mouse' || type === 'mice') {
        mice.push(dispName);
      } else if (type === 'webcam' || type === 'camera') {
        webcams.push(dispName);
      }
    }
  } else if (peripheralsRaw && typeof peripheralsRaw === 'object') {
    // Process structured mock peripherals
    const m = peripheralsRaw.monitors || peripheralsRaw.Monitors || [];
    const k = peripheralsRaw.keyboards || peripheralsRaw.Keyboards || [];
    const mic = peripheralsRaw.mice || peripheralsRaw.Mice || [];
    const w = peripheralsRaw.webcams || peripheralsRaw.Webcams || [];
    monitors = Array.isArray(m) ? m : [];
    keyboards = Array.isArray(k) ? k : [];
    mice = Array.isArray(mic) ? mic : [];
    webcams = Array.isArray(w) ? w : [];
  }

  // Direct fallbacks if arrays are on raw directly
  if (monitors.length === 0 && Array.isArray(raw.monitors || raw.Monitors)) {
    monitors = raw.monitors || raw.Monitors;
  }
  if (keyboards.length === 0 && Array.isArray(raw.keyboards || raw.Keyboards)) {
    keyboards = raw.keyboards || raw.Keyboards;
  }
  if (mice.length === 0 && Array.isArray(raw.mice || raw.Mice)) {
    mice = raw.mice || raw.Mice;
  }
  if (webcams.length === 0 && Array.isArray(raw.webcams || raw.Webcams)) {
    webcams = raw.webcams || raw.Webcams;
  }

  return {
    id: String(getProp(['id', 'Id', 'ID'], '')),
    hostname: String(getProp(['hostname', 'Hostname', 'HostName'], 'Unknown')),
    ipAddress: String(getProp(['ipAddress', 'IpAddress', 'IPAddress', 'ip', 'IP'], '0.0.0.0')),
    macAddress: String(getProp(['macAddress', 'MacAddress', 'MACAddress', 'mac', 'MAC'], '00:00:00:00:00:00')),
    activeUser: String(getProp(['activeUser', 'ActiveUser', 'loggedInUser', 'LoggedInUser', 'user', 'User'], 'None')),
    osVersion: String(getProp(['osVersion', 'OsVersion', 'OSVersion', 'os', 'OS'], 'Unknown OS')),
    serialNumber: String(getProp(['serialNumber', 'SerialNumber', 'serial', 'Serial'], 'N/A')),
    lastSeen: String(getProp(['lastSeen', 'LastSeen', 'last_seen'], new Date().toISOString())),
    hardwareSpecs: {
      cpu: String(hardware.cpu || hardware.Cpu || hardware.CPU || raw.cpu || raw.Cpu || raw.CPU || 'Unknown CPU'),
      ram: String(hardware.ram || hardware.Ram || hardware.RAM || raw.ram || raw.Ram || raw.RAM || 'Unknown RAM'),
      storage: String(hardware.storage || hardware.Storage || raw.storage || raw.Storage || raw.STORAGE || 'Unknown Storage'),
      gpu: hardware.gpu || hardware.Gpu || hardware.GPU || raw.gpu || raw.Gpu || raw.GPU || undefined,
    },
    peripherals: {
      monitors,
      keyboards,
      mice,
      webcams,
    }
  };
}

/**
 * Returns dynamic, high-fidelity mock data representing live assets
 * for use when the backend is offline.
 */
export function getMockComputers(): Computer[] {
  const now = new Date();
  
  return [
    {
      id: "comp-01",
      hostname: "IT-LPT-MINA",
      ipAddress: "192.168.1.112",
      macAddress: "3D:4E:5F:6A:7B:8C",
      activeUser: "Mina Al-Ahmadi",
      osVersion: "Windows 11 Enterprise 23H2",
      serialNumber: "MXL03401FL",
      lastSeen: new Date(now.getTime() - 2 * 60 * 1000).toISOString(), // 2 mins ago (Online)
      hardwareSpecs: {
        cpu: "Intel Core i7-13700H (14 Cores, up to 5.0GHz)",
        ram: "32 GB DDR5 5200MHz",
        storage: "1 TB NVMe PCIe Gen4 SSD",
        gpu: "Intel Iris Xe Graphics"
      },
      peripherals: {
        monitors: ["Dell UltraSharp U2720Q 27\" 4K", "HP E24 G4 24\" FHD"],
        keyboards: ["Keychron K8 Pro Mechanical Keyboard (Brown Switch)"],
        mice: ["Logitech MX Master 3S Wireless Mouse"],
        webcams: ["Logitech Brio 4K Ultra HD Webcam"]
      }
    },
    {
      id: "comp-02",
      hostname: "DEV-WORKSTATION-01",
      ipAddress: "192.168.1.145",
      macAddress: "A1:B2:C3:D4:E5:F6",
      activeUser: "John Doe",
      osVersion: "Ubuntu 22.04.3 LTS (Jammy Jellyfish)",
      serialNumber: "SN-94810294",
      lastSeen: new Date(now.getTime() - 4 * 60 * 1000).toISOString(), // 4 mins ago (Online)
      hardwareSpecs: {
        cpu: "AMD Ryzen 9 7900X (12 Cores, 24 Threads, up to 5.6GHz)",
        ram: "64 GB DDR5 5600MHz (Dual Channel)",
        storage: "2 TB Samsung 990 Pro NVMe SSD",
        gpu: "NVIDIA GeForce RTX 4070 Ti 12GB"
      },
      peripherals: {
        monitors: ["ASUS ROG Swift 32\" 4K 144Hz", "GIGABYTE M27Q 27\" 170Hz"],
        keyboards: ["Ducky One 3 Mechanical Keyboard (Red Switches)"],
        mice: ["Logitech G502 LightSpeed Wireless"],
        webcams: ["Razer Kiyo Pro Stream Webcam"]
      }
    },
    {
      id: "comp-03",
      hostname: "DESIGN-MAC-02",
      ipAddress: "192.168.2.55",
      macAddress: "8C:85:90:3A:4B:5C",
      activeUser: "Sarah Connor",
      osVersion: "macOS Sequoia 15.1.1",
      serialNumber: "C02FP123Q05D",
      lastSeen: new Date(now.getTime() - 12 * 60 * 1000).toISOString(), // 12 mins ago (Offline)
      hardwareSpecs: {
        cpu: "Apple M3 Max (16-Core CPU, 40-Core GPU)",
        ram: "48 GB Unified Memory",
        storage: "1 TB Apple Flash Storage SSD",
        gpu: "Integrated Apple 40-Core GPU"
      },
      peripherals: {
        monitors: ["Apple Studio Display 27\" 5K Retina"],
        keyboards: ["Apple Magic Keyboard with Touch ID"],
        mice: ["Apple Magic Mouse 2"],
        webcams: ["Built-in FaceTime HD Camera (1080p)"]
      }
    },
    {
      id: "comp-04",
      hostname: "PROD-SRV-01",
      ipAddress: "10.0.0.15",
      macAddress: "00:15:5D:01:12:0A",
      activeUser: "System (Service Account)",
      osVersion: "Windows Server 2022 Datacenter",
      serialNumber: "VMW-1049285",
      lastSeen: new Date(now.getTime() - 1 * 60 * 1000).toISOString(), // 1 min ago (Online)
      hardwareSpecs: {
        cpu: "Intel Xeon Silver 4314 (16 Cores, 32 Threads, 2.40 GHz)",
        ram: "128 GB DDR4 ECC Registered RAM",
        storage: "4 TB SSD Hardware RAID-5 Array",
        gpu: "Basic Microsoft Display Adapter"
      },
      peripherals: {
        monitors: [],
        keyboards: ["Rackmount 1U KVM Console Drawer"],
        mice: ["Rackmount KVM Touchpad"],
        webcams: []
      }
    },
    {
      id: "comp-05",
      hostname: "FIN-LPT-04",
      ipAddress: "192.168.1.201",
      macAddress: "BC:CF:8F:A1:B2:C3",
      activeUser: "Alex Mercer",
      osVersion: "Windows 10 Pro 22H2",
      serialNumber: "FTX948102BS",
      lastSeen: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago (Offline)
      hardwareSpecs: {
        cpu: "Intel Core i5-1135G7 (4 Cores, up to 4.2GHz)",
        ram: "16 GB DDR4 3200MHz",
        storage: "512 GB NVMe PCIe Gen3 SSD",
        gpu: "Intel Iris Xe Graphics"
      },
      peripherals: {
        monitors: ["Lenovo ThinkVision T24i-20 23.8\""],
        keyboards: ["Logitech K120 USB Keyboard"],
        mice: ["Logitech B100 Optical Mouse"],
        webcams: []
      }
    }
  ];
}

/**
 * Checks backend API running at http://localhost:5067/api/computers or
 * http://localhost:5067/api/inventory and retrieves assets.
 * Falls back to high-fidelity mock data if the API is offline.
 */
export async function fetchComputers(): Promise<{ computers: Computer[]; isMock: boolean }> {
  const endpoints = [
    'http://localhost:5067/api/computers',
    'http://localhost:5067/api/inventory',
  ];

  for (const url of endpoints) {
    try {
      // Set a short timeout of 2 seconds so page loads do not hang if backend is down
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(url, { 
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.items || data.data || []);
        if (Array.isArray(list) && list.length > 0) {
          return { computers: list.map(normalizeComputer), isMock: false };
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch from endpoint ${url}:`, e);
    }
  }

  // Fallback to mock data
  return { computers: getMockComputers(), isMock: true };
}

/**
 * Checks backend API for a specific computer, falling back to mock details.
 */
export async function fetchComputerById(id: string): Promise<{ computer: Computer | null; isMock: boolean }> {
  const endpoints = [
    `http://localhost:5067/api/computers/${id}`,
    `http://localhost:5067/api/inventory/${id}`,
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(url, { 
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data) {
          return { computer: normalizeComputer(data), isMock: false };
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch details from endpoint ${url}:`, e);
    }
  }

  // Fallback to mock data
  const mock = getMockComputers().find(c => c.id === id);
  return { computer: mock || null, isMock: true };
}
