/**
 * PlumbCore AI — Pricebook Items
 * 200+ pre-loaded plumbing parts and repair types
 */

export interface PricebookItem {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  unitType: string;
  isRepairType: boolean;
  estimatedHours?: number;
  description?: string;
  commonBrands?: string[];
}

const pipeFittings: PricebookItem[] = [
  { id: 'PB-001', name: 'PEX Tubing 1/2" x 100ft', category: 'Pipe', unitPrice: 28.99, unitType: 'roll', isRepairType: false, commonBrands: ['Uponor', 'SharkBite', 'Zurn'] },
  { id: 'PB-002', name: 'PEX Tubing 3/4" x 100ft', category: 'Pipe', unitPrice: 36.99, unitType: 'roll', isRepairType: false, commonBrands: ['Uponor', 'SharkBite', 'Zurn'] },
  { id: 'PB-003', name: 'PEX Tubing 1" x 100ft', category: 'Pipe', unitPrice: 48.99, unitType: 'roll', isRepairType: false, commonBrands: ['Uponor', 'SharkBite', 'Zurn'] },
  { id: 'PB-004', name: 'PVC Pipe Schedule 40 1/2" x 10ft', category: 'Pipe', unitPrice: 4.49, unitType: 'length', isRepairType: false, commonBrands: ['Charlotte', 'JM Eagle', 'NIBCO'] },
  { id: 'PB-005', name: 'PVC Pipe Schedule 40 3/4" x 10ft', category: 'Pipe', unitPrice: 5.79, unitType: 'length', isRepairType: false },
  { id: 'PB-006', name: 'PVC Pipe Schedule 40 1" x 10ft', category: 'Pipe', unitPrice: 7.49, unitType: 'length', isRepairType: false },
  { id: 'PB-007', name: 'PVC Pipe Schedule 40 2" x 10ft', category: 'Pipe', unitPrice: 12.99, unitType: 'length', isRepairType: false },
  { id: 'PB-008', name: 'PVC Pipe Schedule 40 4" x 10ft', category: 'Pipe', unitPrice: 24.99, unitType: 'length', isRepairType: false },
  { id: 'PB-009', name: 'Copper Pipe Type L 1/2" x 10ft', category: 'Pipe', unitPrice: 15.99, unitType: 'length', isRepairType: false },
  { id: 'PB-010', name: 'Copper Pipe Type L 3/4" x 10ft', category: 'Pipe', unitPrice: 22.99, unitType: 'length', isRepairType: false },
  { id: 'PB-011', name: 'Copper Pipe Type L 1" x 10ft', category: 'Pipe', unitPrice: 31.99, unitType: 'length', isRepairType: false },
  { id: 'PB-012', name: 'Galvanized Steel Pipe 1/2" x 10ft', category: 'Pipe', unitPrice: 18.49, unitType: 'length', isRepairType: false },
  { id: 'PB-013', name: 'Galvanized Steel Pipe 3/4" x 10ft', category: 'Pipe', unitPrice: 22.99, unitType: 'length', isRepairType: false },
  { id: 'PB-014', name: 'ABS Pipe 1-1/2" x 10ft', category: 'Pipe', unitPrice: 8.99, unitType: 'length', isRepairType: false },
  { id: 'PB-015', name: 'ABS Pipe 3" x 10ft', category: 'Pipe', unitPrice: 14.99, unitType: 'length', isRepairType: false },
  { id: 'PB-016', name: 'PEX-A Tubing 1/2" x 300ft', category: 'Pipe', unitPrice: 64.99, unitType: 'roll', isRepairType: false },
  { id: 'PB-017', name: 'CPVC Pipe 1/2" x 10ft', category: 'Pipe', unitPrice: 5.99, unitType: 'length', isRepairType: false },
  { id: 'PB-018', name: 'CPVC Pipe 3/4" x 10ft', category: 'Pipe', unitPrice: 7.49, unitType: 'length', isRepairType: false },
  { id: 'PB-019', name: 'Flexible Gas Line 1/2" x 48"', category: 'Pipe', unitPrice: 18.99, unitType: 'each', isRepairType: false },
  { id: 'PB-020', name: 'Flexible Gas Line 3/4" x 48"', category: 'Pipe', unitPrice: 24.99, unitType: 'each', isRepairType: false },
];

const fittings: PricebookItem[] = [
  { id: 'PB-021', name: 'SharkBite Push-to-Connect Coupling 1/2"', category: 'Fitting', unitPrice: 6.99, unitType: 'each', isRepairType: false },
  { id: 'PB-022', name: 'SharkBite Push-to-Connect Coupling 3/4"', category: 'Fitting', unitPrice: 8.99, unitType: 'each', isRepairType: false },
  { id: 'PB-023', name: 'SharkBite Push-to-Connect Coupling 1"', category: 'Fitting', unitPrice: 12.99, unitType: 'each', isRepairType: false },
  { id: 'PB-024', name: 'SharkBite 90-Degree Elbow 1/2"', category: 'Fitting', unitPrice: 7.49, unitType: 'each', isRepairType: false },
  { id: 'PB-025', name: 'SharkBite 90-Degree Elbow 3/4"', category: 'Fitting', unitPrice: 9.49, unitType: 'each', isRepairType: false },
  { id: 'PB-026', name: 'SharkBite Tee 1/2"', category: 'Fitting', unitPrice: 8.99, unitType: 'each', isRepairType: false },
  { id: 'PB-027', name: 'SharkBite Tee 3/4"', category: 'Fitting', unitPrice: 11.99, unitType: 'each', isRepairType: false },
  { id: 'PB-028', name: 'PVC Coupling 1/2"', category: 'Fitting', unitPrice: 0.89, unitType: 'each', isRepairType: false },
  { id: 'PB-029', name: 'PVC Coupling 3/4"', category: 'Fitting', unitPrice: 1.29, unitType: 'each', isRepairType: false },
  { id: 'PB-030', name: 'PVC Coupling 1"', category: 'Fitting', unitPrice: 1.79, unitType: 'each', isRepairType: false },
  { id: 'PB-031', name: 'PVC Coupling 2"', category: 'Fitting', unitPrice: 2.99, unitType: 'each', isRepairType: false },
  { id: 'PB-032', name: 'PVC 90-Degree Elbow 1/2"', category: 'Fitting', unitPrice: 0.99, unitType: 'each', isRepairType: false },
  { id: 'PB-033', name: 'PVC 90-Degree Elbow 3/4"', category: 'Fitting', unitPrice: 1.39, unitType: 'each', isRepairType: false },
  { id: 'PB-034', name: 'PVC 90-Degree Elbow 1"', category: 'Fitting', unitPrice: 1.99, unitType: 'each', isRepairType: false },
  { id: 'PB-035', name: 'PVC 45-Degree Elbow 1/2"', category: 'Fitting', unitPrice: 0.89, unitType: 'each', isRepairType: false },
  { id: 'PB-036', name: 'PVC Tee 1/2"', category: 'Fitting', unitPrice: 1.29, unitType: 'each', isRepairType: false },
  { id: 'PB-037', name: 'PVC Tee 3/4"', category: 'Fitting', unitPrice: 1.69, unitType: 'each', isRepairType: false },
  { id: 'PB-038', name: 'PVC Tee 1"', category: 'Fitting', unitPrice: 2.49, unitType: 'each', isRepairType: false },
  { id: 'PB-039', name: 'Copper Coupling 1/2"', category: 'Fitting', unitPrice: 0.79, unitType: 'each', isRepairType: false },
  { id: 'PB-040', name: 'Copper Coupling 3/4"', category: 'Fitting', unitPrice: 1.09, unitType: 'each', isRepairType: false },
  { id: 'PB-041', name: 'Copper 90-Degree Elbow 1/2"', category: 'Fitting', unitPrice: 1.29, unitType: 'each', isRepairType: false },
  { id: 'PB-042', name: 'Copper 90-Degree Elbow 3/4"', category: 'Fitting', unitPrice: 1.69, unitType: 'each', isRepairType: false },
  { id: 'PB-043', name: 'Copper Tee 1/2"', category: 'Fitting', unitPrice: 1.89, unitType: 'each', isRepairType: false },
  { id: 'PB-044', name: 'Copper Tee 3/4"', category: 'Fitting', unitPrice: 2.49, unitType: 'each', isRepairType: false },
  { id: 'PB-045', name: 'Brass NPT Adapter 1/2"', category: 'Fitting', unitPrice: 3.49, unitType: 'each', isRepairType: false },
  { id: 'PB-046', name: 'Brass NPT Adapter 3/4"', category: 'Fitting', unitPrice: 4.29, unitType: 'each', isRepairType: false },
  { id: 'PB-047', name: 'PEX Crimp Ring 1/2" (50-pack)', category: 'Fitting', unitPrice: 8.99, unitType: 'pack', isRepairType: false },
  { id: 'PB-048', name: 'PEX Crimp Ring 3/4" (50-pack)', category: 'Fitting', unitPrice: 11.99, unitType: 'pack', isRepairType: false },
  { id: 'PB-049', name: 'PEX Expansion Ring 1/2" (25-pack)', category: 'Fitting', unitPrice: 14.99, unitType: 'pack', isRepairType: false },
  { id: 'PB-050', name: 'PEX Expansion Ring 3/4" (25-pack)', category: 'Fitting', unitPrice: 18.99, unitType: 'pack', isRepairType: false },
];

const valves: PricebookItem[] = [
  { id: 'PB-051', name: 'Ball Valve Brass 1/2"', category: 'Valve', unitPrice: 7.99, unitType: 'each', isRepairType: false },
  { id: 'PB-052', name: 'Ball Valve Brass 3/4"', category: 'Valve', unitPrice: 9.99, unitType: 'each', isRepairType: false },
  { id: 'PB-053', name: 'Ball Valve Brass 1"', category: 'Valve', unitPrice: 14.99, unitType: 'each', isRepairType: false },
  { id: 'PB-054', name: 'PVC Ball Valve 1/2"', category: 'Valve', unitPrice: 5.99, unitType: 'each', isRepairType: false },
  { id: 'PB-055', name: 'PVC Ball Valve 3/4"', category: 'Valve', unitPrice: 7.49, unitType: 'each', isRepairType: false },
  { id: 'PB-056', name: 'PVC Ball Valve 1"', category: 'Valve', unitPrice: 9.99, unitType: 'each', isRepairType: false },
  { id: 'PB-057', name: 'PVC Ball Valve 2"', category: 'Valve', unitPrice: 16.99, unitType: 'each', isRepairType: false },
  { id: 'PB-058', name: 'Gate Valve Brass 1/2"', category: 'Valve', unitPrice: 12.99, unitType: 'each', isRepairType: false },
  { id: 'PB-059', name: 'Gate Valve Brass 3/4"', category: 'Valve', unitPrice: 16.99, unitType: 'each', isRepairType: false },
  { id: 'PB-060', name: 'Globe Valve Brass 1/2"', category: 'Valve', unitPrice: 14.99, unitType: 'each', isRepairType: false },
  { id: 'PB-061', name: 'Check Valve Brass 3/4"', category: 'Valve', unitPrice: 11.99, unitType: 'each', isRepairType: false },
  { id: 'PB-062', name: 'Check Valve PVC 1-1/2"', category: 'Valve', unitPrice: 8.99, unitType: 'each', isRepairType: false },
  { id: 'PB-063', name: 'Pressure Reducing Valve 3/4"', category: 'Valve', unitPrice: 42.99, unitType: 'each', isRepairType: false },
  { id: 'PB-064', name: 'Pressure Reducing Valve 1"', category: 'Valve', unitPrice: 54.99, unitType: 'each', isRepairType: false },
  { id: 'PB-065', name: 'Relief Valve Water Heater 3/4"', category: 'Valve', unitPrice: 12.99, unitType: 'each', isRepairType: false },
  { id: 'PB-066', name: 'Relief Valve Water Heater 1/2"', category: 'Valve', unitPrice: 10.99, unitType: 'each', isRepairType: false },
  { id: 'PB-067', name: 'Angle Stop Valve 1/2" Chrome', category: 'Valve', unitPrice: 6.99, unitType: 'each', isRepairType: false },
  { id: 'PB-068', name: 'Angle Stop Valve 3/8" Chrome', category: 'Valve', unitPrice: 7.49, unitType: 'each', isRepairType: false },
  { id: 'PB-069', name: 'Sillcock Frost-Free 1/2"', category: 'Valve', unitPrice: 18.99, unitType: 'each', isRepairType: false },
  { id: 'PB-070', name: 'Sillcock Frost-Free 3/4"', category: 'Valve', unitPrice: 24.99, unitType: 'each', isRepairType: false },
];

const fixtures: PricebookItem[] = [
  { id: 'PB-071', name: 'Toilet Complete with Seat, White', category: 'Fixture', unitPrice: 129.99, unitType: 'each', isRepairType: false, commonBrands: ['American Standard', 'Kohler', 'TOTO'] },
  { id: 'PB-072', name: 'Toilet Complete with Seat, Elongated', category: 'Fixture', unitPrice: 149.99, unitType: 'each', isRepairType: false },
  { id: 'PB-073', name: 'Toilet Flush Valve Kit', category: 'Fixture', unitPrice: 9.99, unitType: 'kit', isRepairType: false },
  { id: 'PB-074', name: 'Toilet Fill Valve Assembly', category: 'Fixture', unitPrice: 7.99, unitType: 'each', isRepairType: false },
  { id: 'PB-075', name: 'Toilet Wax Ring with Bolt Kit', category: 'Fixture', unitPrice: 4.99, unitType: 'kit', isRepairType: false },
  { id: 'PB-076', name: 'Toilet Flapper Universal', category: 'Fixture', unitPrice: 3.49, unitType: 'each', isRepairType: false },
  { id: 'PB-077', name: 'Toilet Seat, White, Round', category: 'Fixture', unitPrice: 24.99, unitType: 'each', isRepairType: false },
  { id: 'PB-078', name: 'Toilet Seat, White, Elongated', category: 'Fixture', unitPrice: 29.99, unitType: 'each', isRepairType: false },
  { id: 'PB-079', name: 'Bathroom Sink Faucet, Chrome, 2-handle', category: 'Fixture', unitPrice: 54.99, unitType: 'each', isRepairType: false },
  { id: 'PB-080', name: 'Bathroom Sink Faucet, Chrome, Single-handle', category: 'Fixture', unitPrice: 49.99, unitType: 'each', isRepairType: false },
  { id: 'PB-081', name: 'Kitchen Faucet, Pull-Down, Stainless', category: 'Fixture', unitPrice: 129.99, unitType: 'each', isRepairType: false },
  { id: 'PB-082', name: 'Kitchen Faucet, Standard, Chrome', category: 'Fixture', unitPrice: 79.99, unitType: 'each', isRepairType: false },
  { id: 'PB-083', name: 'Bathroom Sink, White, Drop-in 19x17"', category: 'Fixture', unitPrice: 44.99, unitType: 'each', isRepairType: false },
  { id: 'PB-084', name: 'Bathroom Sink, White, Undermount 19x17"', category: 'Fixture', unitPrice: 59.99, unitType: 'each', isRepairType: false },
  { id: 'PB-085', name: 'Kitchen Sink, Stainless, Double-basin 33x22"', category: 'Fixture', unitPrice: 169.99, unitType: 'each', isRepairType: false },
  { id: 'PB-086', name: 'Kitchen Sink, Stainless, Single-basin 30x18"', category: 'Fixture', unitPrice: 119.99, unitType: 'each', isRepairType: false },
  { id: 'PB-087', name: 'Shower Head, Chrome, Adjustable', category: 'Fixture', unitPrice: 19.99, unitType: 'each', isRepairType: false },
  { id: 'PB-088', name: 'Shower Head, Rainfall, 8" Chrome', category: 'Fixture', unitPrice: 39.99, unitType: 'each', isRepairType: false },
  { id: 'PB-089', name: 'Shower Valve Trim Kit, Chrome', category: 'Fixture', unitPrice: 49.99, unitType: 'kit', isRepairType: false },
  { id: 'PB-090', name: 'Shower Cartridge Replacement (Moen 1222)', category: 'Fixture', unitPrice: 14.99, unitType: 'each', isRepairType: false },
  { id: 'PB-091', name: 'Shower Cartridge Replacement (Delta)', category: 'Fixture', unitPrice: 12.99, unitType: 'each', isRepairType: false },
  { id: 'PB-092', name: 'Tub Drain Assembly with Overflow', category: 'Fixture', unitPrice: 18.99, unitType: 'kit', isRepairType: false },
  { id: 'PB-093', name: 'Tub Stopper, Pop-up, Chrome', category: 'Fixture', unitPrice: 7.99, unitType: 'each', isRepairType: false },
  { id: 'PB-094', name: 'Sink Drain Assembly, Chrome', category: 'Fixture', unitPrice: 8.99, unitType: 'kit', isRepairType: false },
  { id: 'PB-095', name: 'Sink Trap P-trap, PVC 1-1/2"', category: 'Fixture', unitPrice: 4.99, unitType: 'kit', isRepairType: false },
  { id: 'PB-096', name: 'Sink Trap P-trap, Chrome 1-1/4"', category: 'Fixture', unitPrice: 7.99, unitType: 'kit', isRepairType: false },
  { id: 'PB-097', name: 'Garbage Disposal, 1/2 HP', category: 'Fixture', unitPrice: 79.99, unitType: 'each', isRepairType: false },
  { id: 'PB-098', name: 'Garbage Disposal, 3/4 HP', category: 'Fixture', unitPrice: 109.99, unitType: 'each', isRepairType: false },
];

const waterHeaters: PricebookItem[] = [
  { id: 'PB-099', name: 'Electric Water Heater 30 Gal', category: 'Heater', unitPrice: 349.99, unitType: 'each', isRepairType: false, commonBrands: ['Rheem', 'AO Smith', 'Bradford White'] },
  { id: 'PB-100', name: 'Electric Water Heater 40 Gal', category: 'Heater', unitPrice: 399.99, unitType: 'each', isRepairType: false },
  { id: 'PB-101', name: 'Electric Water Heater 50 Gal', category: 'Heater', unitPrice: 449.99, unitType: 'each', isRepairType: false },
  { id: 'PB-102', name: 'Gas Water Heater 40 Gal', category: 'Heater', unitPrice: 499.99, unitType: 'each', isRepairType: false },
  { id: 'PB-103', name: 'Gas Water Heater 50 Gal', category: 'Heater', unitPrice: 549.99, unitType: 'each', isRepairType: false },
  { id: 'PB-104', name: 'Tankless Water Heater Electric', category: 'Heater', unitPrice: 699.99, unitType: 'each', isRepairType: false },
  { id: 'PB-105', name: 'Tankless Water Heater Gas', category: 'Heater', unitPrice: 899.99, unitType: 'each', isRepairType: false },
  { id: 'PB-106', name: 'Water Heater Thermostat, Electric', category: 'Heater', unitPrice: 14.99, unitType: 'each', isRepairType: false },
  { id: 'PB-107', name: 'Water Heater Heating Element, 4500W', category: 'Heater', unitPrice: 12.99, unitType: 'each', isRepairType: false },
  { id: 'PB-108', name: 'Water Heater Anode Rod', category: 'Heater', unitPrice: 18.99, unitType: 'each', isRepairType: false },
  { id: 'PB-109', name: 'Water Heater Expansion Tank 2 Gal', category: 'Heater', unitPrice: 34.99, unitType: 'each', isRepairType: false },
  { id: 'PB-110', name: 'Water Heater Expansion Tank 5 Gal', category: 'Heater', unitPrice: 49.99, unitType: 'each', isRepairType: false },
  { id: 'PB-111', name: 'Water Heater Drain Pan 26"', category: 'Heater', unitPrice: 14.99, unitType: 'each', isRepairType: false },
  { id: 'PB-112', name: 'Water Heater Flexible Connector 3/4" x 24"', category: 'Heater', unitPrice: 9.99, unitType: 'each', isRepairType: false },
];

const pumpsAndTools: PricebookItem[] = [
  { id: 'PB-113', name: 'Sump Pump, 1/3 HP, Submersible', category: 'Pump', unitPrice: 89.99, unitType: 'each', isRepairType: false },
  { id: 'PB-114', name: 'Sump Pump, 1/2 HP, Submersible', category: 'Pump', unitPrice: 119.99, unitType: 'each', isRepairType: false },
  { id: 'PB-115', name: 'Sump Pump, 1/2 HP, Pedestal', category: 'Pump', unitPrice: 79.99, unitType: 'each', isRepairType: false },
  { id: 'PB-116', name: 'Well Pump, Shallow, 1 HP', category: 'Pump', unitPrice: 199.99, unitType: 'each', isRepairType: false },
  { id: 'PB-117', name: 'Well Pump, Deep, 1 HP', category: 'Pump', unitPrice: 299.99, unitType: 'each', isRepairType: false },
  { id: 'PB-118', name: 'Circulating Pump, Hot Water, 1/25 HP', category: 'Pump', unitPrice: 89.99, unitType: 'each', isRepairType: false },
  { id: 'PB-119', name: 'Utility Pump, Submersible, 1/4 HP', category: 'Pump', unitPrice: 59.99, unitType: 'each', isRepairType: false },
  { id: 'PB-120', name: 'Pipe Wrench 18"', category: 'Tool', unitPrice: 29.99, unitType: 'each', isRepairType: false },
  { id: 'PB-121', name: 'Pipe Wrench 14"', category: 'Tool', unitPrice: 22.99, unitType: 'each', isRepairType: false },
  { id: 'PB-122', name: 'Adjustable Wrench 10"', category: 'Tool', unitPrice: 16.99, unitType: 'each', isRepairType: false },
  { id: 'PB-123', name: 'Basin Wrench', category: 'Tool', unitPrice: 14.99, unitType: 'each', isRepairType: false },
  { id: 'PB-124', name: 'Tubing Cutter 1/2"-1-1/8"', category: 'Tool', unitPrice: 14.99, unitType: 'each', isRepairType: false },
  { id: 'PB-125', name: 'PEX Crimp Tool', category: 'Tool', unitPrice: 39.99, unitType: 'each', isRepairType: false },
  { id: 'PB-126', name: 'PEX Expansion Tool', category: 'Tool', unitPrice: 129.99, unitType: 'each', isRepairType: false },
  { id: 'PB-127', name: 'Propane Torch Kit', category: 'Tool', unitPrice: 24.99, unitType: 'kit', isRepairType: false },
  { id: 'PB-128', name: 'Drain Snake 25ft', category: 'Tool', unitPrice: 34.99, unitType: 'each', isRepairType: false },
  { id: 'PB-129', name: 'Drain Snake 50ft', category: 'Tool', unitPrice: 59.99, unitType: 'each', isRepairType: false },
  { id: 'PB-130', name: 'Plunger, Heavy Duty', category: 'Tool', unitPrice: 8.99, unitType: 'each', isRepairType: false },
  { id: 'PB-131', name: 'Toilet Auger', category: 'Tool', unitPrice: 19.99, unitType: 'each', isRepairType: false },
  { id: 'PB-132', name: 'Pipe Threader Set 1/2"-3/4"', category: 'Tool', unitPrice: 89.99, unitType: 'kit', isRepairType: false },
  { id: 'PB-133', name: 'Multimeter, Digital', category: 'Tool', unitPrice: 29.99, unitType: 'each', isRepairType: false },
  { id: 'PB-134', name: 'Pressure Gauge, Water', category: 'Tool', unitPrice: 12.99, unitType: 'each', isRepairType: false },
  { id: 'PB-135', name: 'Pipe Inspection Camera', category: 'Tool', unitPrice: 199.99, unitType: 'each', isRepairType: false },
  { id: 'PB-136', name: 'Shop Vac, 5 Gal, Wet/Dry', category: 'Tool', unitPrice: 49.99, unitType: 'each', isRepairType: false },
];

const sealantsAndSupplies: PricebookItem[] = [
  { id: 'PB-137', name: 'Pipe Thread Sealant Tape (3-pack)', category: 'Sealant', unitPrice: 3.99, unitType: 'pack', isRepairType: false },
  { id: 'PB-138', name: 'Pipe Joint Compound 4oz', category: 'Sealant', unitPrice: 5.99, unitType: 'tube', isRepairType: false },
  { id: 'PB-139', name: 'PVC Cement 4oz', category: 'Sealant', unitPrice: 4.99, unitType: 'can', isRepairType: false },
  { id: 'PB-140', name: 'PVC Primer 4oz', category: 'Sealant', unitPrice: 4.99, unitType: 'can', isRepairType: false },
  { id: 'PB-141', name: 'CPVC Cement 4oz', category: 'Sealant', unitPrice: 5.49, unitType: 'can', isRepairType: false },
  { id: 'PB-142', name: 'ABS Cement 4oz', category: 'Sealant', unitPrice: 5.49, unitType: 'can', isRepairType: false },
  { id: 'PB-143', name: 'Silicone Caulk, Clear, 10oz', category: 'Sealant', unitPrice: 6.99, unitType: 'tube', isRepairType: false },
  { id: 'PB-144', name: "Plumber's Putty 4oz", category: 'Sealant', unitPrice: 3.49, unitType: 'tub', isRepairType: false },
  { id: 'PB-145', name: 'Epoxy Putty Stick', category: 'Sealant', unitPrice: 5.99, unitType: 'each', isRepairType: false },
  { id: 'PB-146', name: 'Pipe Repair Clamp 1/2"-3/4"', category: 'Sealant', unitPrice: 6.99, unitType: 'each', isRepairType: false },
  { id: 'PB-147', name: 'Pipe Repair Clamp 1"-1-1/4"', category: 'Sealant', unitPrice: 8.99, unitType: 'each', isRepairType: false },
  { id: 'PB-148', name: 'Pipe Repair Clamp 2"', category: 'Sealant', unitPrice: 12.99, unitType: 'each', isRepairType: false },
  { id: 'PB-149', name: 'Hose Bibb Vacuum Breaker', category: 'Sealant', unitPrice: 7.99, unitType: 'each', isRepairType: false },
  { id: 'PB-150', name: 'Water Hammer Arrestor 1/2"', category: 'Sealant', unitPrice: 11.99, unitType: 'each', isRepairType: false },
];

/* ── REPAIR TYPES (labor estimates) ── */

const repairTypes: PricebookItem[] = [
  { id: 'RT-001', name: 'Toilet Replacement (Standard)', category: 'Repair', unitPrice: 185.00, unitType: 'labor', isRepairType: true, estimatedHours: 1.5, description: 'Remove old toilet, install new toilet with wax ring and bolts' },
  { id: 'RT-002', name: 'Toilet Repair (Flapper/Fill Valve)', category: 'Repair', unitPrice: 95.00, unitType: 'labor', isRepairType: true, estimatedHours: 0.75, description: 'Replace toilet flapper, fill valve, or flush valve assembly' },
  { id: 'RT-003', name: 'Toilet Unclog', category: 'Repair', unitPrice: 85.00, unitType: 'labor', isRepairType: true, estimatedHours: 0.5, description: 'Use plunger or auger to clear toilet blockage' },
  { id: 'RT-004', name: 'Faucet Replacement (Kitchen)', category: 'Repair', unitPrice: 145.00, unitType: 'labor', isRepairType: true, estimatedHours: 1.0, description: 'Remove old kitchen faucet, install new faucet' },
  { id: 'RT-005', name: 'Faucet Replacement (Bathroom)', category: 'Repair', unitPrice: 125.00, unitType: 'labor', isRepairType: true, estimatedHours: 1.0, description: 'Remove old bathroom faucet, install new faucet' },
  { id: 'RT-006', name: 'Faucet Repair (Cartridge/Washer)', category: 'Repair', unitPrice: 85.00, unitType: 'labor', isRepairType: true, estimatedHours: 0.75, description: 'Replace worn cartridge or washer to stop leak' },
  { id: 'RT-007', name: 'Water Heater Replacement (Electric 40 Gal)', category: 'Repair', unitPrice: 395.00, unitType: 'labor', isRepairType: true, estimatedHours: 3.0, description: 'Drain and remove old water heater, install new electric water heater' },
  { id: 'RT-008', name: 'Water Heater Replacement (Gas 40 Gal)', category: 'Repair', unitPrice: 495.00, unitType: 'labor', isRepairType: true, estimatedHours: 3.5, description: 'Drain and remove old water heater, install new gas water heater' },
  { id: 'RT-009', name: 'Water Heater Repair (Element/Thermostat)', category: 'Repair', unitPrice: 165.00, unitType: 'labor', isRepairType: true, estimatedHours: 1.0, description: 'Diagnose and replace failed heating element or thermostat' },
  { id: 'RT-010', name: 'Water Heater Flush', category: 'Repair', unitPrice: 95.00, unitType: 'labor', isRepairType: true, estimatedHours: 0.75, description: 'Flush sediment from water heater, check anode rod' },
  { id: 'RT-011', name: 'Pipe Leak Repair (Accessible)', category: 'Repair', unitPrice: 165.00, unitType: 'labor', isRepairType: true, estimatedHours: 1.0, description: 'Repair leaking pipe section in accessible location' },
  { id: 'RT-012', name: 'Pipe Leak Repair (Behind Wall)', category: 'Repair', unitPrice: 425.00, unitType: 'labor', isRepairType: true, estimatedHours: 3.0, description: 'Open wall, repair leaking pipe, patch wall' },
  { id: 'RT-013', name: 'Pipe Leak Repair (Underground)', category: 'Repair', unitPrice: 695.00, unitType: 'labor', isRepairType: true, estimatedHours: 4.0, description: 'Excavate, repair underground pipe leak, backfill' },
  { id: 'RT-014', name: 'Sink Drain Cleaning', category: 'Repair', unitPrice: 95.00, unitType: 'labor', isRepairType: true, estimatedHours: 0.75, description: 'Snake and clear kitchen or bathroom sink drain' },
  { id: 'RT-015', name: 'Main Drain Cleaning', category: 'Repair', unitPrice: 295.00, unitType: 'labor', isRepairType: true, estimatedHours: 2.0, description: 'Power snake main sewer line, clear blockage' },
  { id: 'RT-016', name: 'Main Drain Cleaning (Hydro-Jet)', category: 'Repair', unitPrice: 495.00, unitType: 'labor', isRepairType: true, estimatedHours: 2.5, description: 'Hydro-jet main sewer line for thorough cleaning' },
  { id: 'RT-017', name: 'Sewer Line Camera Inspection', category: 'Repair', unitPrice: 195.00, unitType: 'labor', isRepairType: true, estimatedHours: 1.0, description: 'Camera inspection of sewer line with video report' },
  { id: 'RT-018', name: 'Shower Head Replacement', category: 'Repair', unitPrice: 65.00, unitType: 'labor', isRepairType: true, estimatedHours: 0.5, description: 'Remove old shower head, install new shower head' },
  { id: 'RT-019', name: 'Shower Valve Replacement', category: 'Repair', unitPrice: 295.00, unitType: 'labor', isRepairType: true, estimatedHours: 2.5, description: 'Replace shower mixing valve, may require wall access' },
  { id: 'RT-020', name: 'Sump Pump Replacement', category: 'Repair', unitPrice: 225.00, unitType: 'labor', isRepairType: true, estimatedHours: 1.5, description: 'Remove old sump pump, install new pump with check valve' },
  { id: 'RT-021', name: 'Garbage Disposal Replacement', category: 'Repair', unitPrice: 115.00, unitType: 'labor', isRepairType: true, estimatedHours: 1.0, description: 'Remove old disposal, install new disposal unit' },
  { id: 'RT-022', name: 'Tankless Water Heater Installation', category: 'Repair', unitPrice: 695.00, unitType: 'labor', isRepairType: true, estimatedHours: 5.0, description: 'Install tankless water heater with venting and gas/electrical' },
  { id: 'RT-023', name: 'Gas Line Installation', category: 'Repair', unitPrice: 295.00, unitType: 'labor', isRepairType: true, estimatedHours: 2.0, description: 'Run gas line from source to appliance (per 10ft)' },
  { id: 'RT-024', name: 'Water Pressure Regulator Replacement', category: 'Repair', unitPrice: 195.00, unitType: 'labor', isRepairType: true, estimatedHours: 1.5, description: 'Replace pressure reducing valve on main water line' },
  { id: 'RT-025', name: 'Backflow Preventer Testing', category: 'Repair', unitPrice: 125.00, unitType: 'labor', isRepairType: true, estimatedHours: 0.75, description: 'Test backflow prevention device, submit report' },
  { id: 'RT-026', name: 'Backflow Preventer Replacement', category: 'Repair', unitPrice: 325.00, unitType: 'labor', isRepairType: true, estimatedHours: 2.0, description: 'Replace faulty backflow prevention device' },
  { id: 'RT-027', name: 'Water Line Replacement (Main)', category: 'Repair', unitPrice: 895.00, unitType: 'labor', isRepairType: true, estimatedHours: 6.0, description: 'Replace main water service line from meter to house' },
  { id: 'RT-028', name: 'Sewer Line Replacement', category: 'Repair', unitPrice: 2495.00, unitType: 'labor', isRepairType: true, estimatedHours: 12.0, description: 'Excavate and replace main sewer line (per 10ft section)' },
  { id: 'RT-029', name: 'Sewer Line Trenchless Repair', category: 'Repair', unitPrice: 1995.00, unitType: 'labor', isRepairType: true, estimatedHours: 8.0, description: 'Trenchless pipe lining or burst repair' },
  { id: 'RT-030', name: 'Water Softener Installation', category: 'Repair', unitPrice: 395.00, unitType: 'labor', isRepairType: true, estimatedHours: 2.5, description: 'Install water softener with bypass and drain line' },
  { id: 'RT-031', name: 'Emergency Service Call (After Hours)', category: 'Repair', unitPrice: 195.00, unitType: 'labor', isRepairType: true, estimatedHours: 1.0, description: 'Emergency after-hours service call fee' },
  { id: 'RT-032', name: 'Diagnostic Service Call', category: 'Repair', unitPrice: 85.00, unitType: 'labor', isRepairType: true, estimatedHours: 0.5, description: 'Standard diagnostic fee to inspect and diagnose issue' },
  { id: 'RT-033', name: 'Gas Water Heater Thermocouple Replacement', category: 'Repair', unitPrice: 125.00, unitType: 'labor', isRepairType: true, estimatedHours: 0.75, description: 'Replace faulty thermocouple on gas water heater' },
  { id: 'RT-034', name: 'Outside Hose Bibb Replacement', category: 'Repair', unitPrice: 115.00, unitType: 'labor', isRepairType: true, estimatedHours: 1.0, description: 'Replace outdoor spigot/hose bibb, may require access from inside' },
  { id: 'RT-035', name: 'Bathroom Sink Replacement (Complete)', category: 'Repair', unitPrice: 295.00, unitType: 'labor', isRepairType: true, estimatedHours: 2.5, description: 'Remove vanity/sink, install new sink and faucet, connect drain' },
  { id: 'RT-036', name: 'Kitchen Sink Replacement (Complete)', category: 'Repair', unitPrice: 345.00, unitType: 'labor', isRepairType: true, estimatedHours: 3.0, description: 'Replace kitchen sink and faucet, connect disposal if present' },
  { id: 'RT-037', name: 'Water Line Ice Protection (Heat Tape)', category: 'Repair', unitPrice: 145.00, unitType: 'labor', isRepairType: true, estimatedHours: 1.0, description: 'Install heat tape on exposed water lines with insulation' },
  { id: 'RT-038', name: 'Radiator/Baseboard Heater Valve Replacement', category: 'Repair', unitPrice: 175.00, unitType: 'labor', isRepairType: true, estimatedHours: 1.5, description: 'Replace radiator control valve or bleed valve' },
];

export const pricebook: PricebookItem[] = [
  ...pipeFittings,
  ...fittings,
  ...valves,
  ...fixtures,
  ...waterHeaters,
  ...pumpsAndTools,
  ...sealantsAndSupplies,
  ...repairTypes,
];

export const pricebookCategories = [...new Set(pricebook.map((item) => item.category))];

export const repairTypesList = pricebook.filter((item) => item.isRepairType);

export const partsList = pricebook.filter((item) => !item.isRepairType);