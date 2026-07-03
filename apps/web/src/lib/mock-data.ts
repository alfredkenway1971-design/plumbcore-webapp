/* ──────────────────────────────────────────────
   PlumbCore AI — Mock Data
   Comprehensive test data for the full application
   ────────────────────────────────────────────── */

export type JobStatus = 'scheduled' | 'in-progress' | 'completed' | 'urgent' | 'cancelled';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'check' | 'cash';
export type InventoryCategory = 'pipe' | 'fitting' | 'valve' | 'fixture' | 'tool' | 'sealant' | 'heater' | 'pump';
export type ActivityType = 'job_created' | 'job_completed' | 'invoice_paid' | 'client_added' | 'estimate_sent';
export type TransactionType = 'Received' | 'Used' | 'Adjusted';
export type POStatus = 'Draft' | 'Sent' | 'Received' | 'Cancelled';

/* ── Clients (20+) ── */
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  company?: string;
  notes?: string;
  createdAt: string;
  totalJobs: number;
  totalRevenue: number;
}

export const clients: Client[] = [
  { id: 'CLT-001', name: 'James & Sarah Johnson', email: 'johnson@email.com', phone: '(555) 101-2001', address: '123 Oak St', city: 'Austin', state: 'TX', zip: '73301', createdAt: '2024-01-15', totalJobs: 8, totalRevenue: 12450 },
  { id: 'CLT-002', name: 'Robert Davis', email: 'rdavis@email.com', phone: '(555) 101-2002', address: '456 Maple Ave', city: 'Austin', state: 'TX', zip: '73302', createdAt: '2024-01-20', totalJobs: 5, totalRevenue: 8900 },
  { id: 'CLT-003', name: 'Maria Wilson', email: 'mwilson@email.com', phone: '(555) 101-2003', address: '789 Pine Rd', city: 'Round Rock', state: 'TX', zip: '78664', createdAt: '2024-02-03', totalJobs: 12, totalRevenue: 18300 },
  { id: 'CLT-004', name: 'Carlos Garcia', email: 'cgarcia@email.com', phone: '(555) 101-2004', address: '321 Elm St', city: 'Austin', state: 'TX', zip: '73303', createdAt: '2024-02-10', totalJobs: 3, totalRevenue: 4200 },
  { id: 'CLT-005', name: 'Emily Thompson', email: 'ethompson@email.com', phone: '(555) 101-2005', address: '654 Birch Ln', city: 'Cedar Park', state: 'TX', zip: '78613', createdAt: '2024-02-18', totalJobs: 7, totalRevenue: 11200 },
  { id: 'CLT-006', name: 'Michael Brown', email: 'mbrown@email.com', phone: '(555) 101-2006', address: '987 Cedar Dr', city: 'Austin', state: 'TX', zip: '73304', createdAt: '2024-03-01', totalJobs: 10, totalRevenue: 15750 },
  { id: 'CLT-007', name: 'Patricia Martinez', email: 'pmartinez@email.com', phone: '(555) 101-2007', address: '246 Walnut Way', city: 'Pflugerville', state: 'TX', zip: '78660', createdAt: '2024-03-05', totalJobs: 4, totalRevenue: 6100 },
  { id: 'CLT-008', name: 'David Anderson', email: 'danderson@email.com', phone: '(555) 101-2008', address: '135 Spruce Ct', city: 'Austin', state: 'TX', zip: '73305', createdAt: '2024-03-12', totalJobs: 6, totalRevenue: 9400 },
  { id: 'CLT-009', name: 'Linda Thomas', email: 'lthomas@email.com', phone: '(555) 101-2009', address: '753 Ash Blvd', city: 'Georgetown', state: 'TX', zip: '78626', createdAt: '2024-03-20', totalJobs: 9, totalRevenue: 13800 },
  { id: 'CLT-010', name: 'Joseph White', email: 'jwhite@email.com', phone: '(555) 101-2010', address: '159 Poplar Ave', city: 'Austin', state: 'TX', zip: '73306', createdAt: '2024-04-01', totalJobs: 2, totalRevenue: 3100 },
  { id: 'CLT-011', name: 'Oak Springs Apartments', email: 'leasing@oaksprings.com', phone: '(555) 101-2011', address: '4000 Spring Hollow Dr', city: 'Austin', state: 'TX', zip: '73307', company: 'Oak Springs Properties LLC', createdAt: '2024-04-05', totalJobs: 15, totalRevenue: 45000 },
  { id: 'CLT-012', name: 'Barbara Harris', email: 'bharris@email.com', phone: '(555) 101-2012', address: '852 Magnolia St', city: 'Round Rock', state: 'TX', zip: '78665', createdAt: '2024-04-10', totalJobs: 3, totalRevenue: 5200 },
  { id: 'CLT-013', name: 'Main Street Diner', email: 'manager@mainstdiner.com', phone: '(555) 101-2013', address: '100 Main St', city: 'Austin', state: 'TX', zip: '73301', company: 'Main Street Hospitality', createdAt: '2024-04-18', totalJobs: 6, totalRevenue: 22100 },
  { id: 'CLT-014', name: 'Thomas Clark', email: 'tclark@email.com', phone: '(555) 101-2014', address: '369 Hickory Ln', city: 'Pflugerville', state: 'TX', zip: '78661', createdAt: '2024-04-25', totalJobs: 5, totalRevenue: 7800 },
  { id: 'CLT-015', name: 'Sunset Retirement Home', email: 'facilities@sunsetretire.com', phone: '(555) 101-2015', address: '500 Sunset Blvd', city: 'Austin', state: 'TX', zip: '73308', company: 'Sunset Senior Living', createdAt: '2024-05-02', totalJobs: 20, totalRevenue: 68000 },
  { id: 'CLT-016', name: 'Kevin Robinson', email: 'krobinson@email.com', phone: '(555) 101-2016', address: '741 Chestnut Ct', city: 'Cedar Park', state: 'TX', zip: '78614', createdAt: '2024-05-08', totalJobs: 4, totalRevenue: 6350 },
  { id: 'CLT-017', name: 'Riverside Church', email: 'office@riversidechurch.org', phone: '(555) 101-2017', address: '200 River Rd', city: 'Austin', state: 'TX', zip: '73309', company: 'Riverside Community Church', createdAt: '2024-05-15', totalJobs: 8, totalRevenue: 28500 },
  { id: 'CLT-018', name: 'Nancy Lee', email: 'nlee@email.com', phone: '(555) 101-2018', address: '258 Willow Dr', city: 'Georgetown', state: 'TX', zip: '78627', createdAt: '2024-05-22', totalJobs: 2, totalRevenue: 3400 },
  { id: 'CLT-019', name: 'TechHub Office Park', email: 'property@techhub.com', phone: '(555) 101-2019', address: '300 Innovation Way', city: 'Austin', state: 'TX', zip: '73310', company: 'TechHub Properties LLC', createdAt: '2024-06-01', totalJobs: 12, totalRevenue: 52000 },
  { id: 'CLT-020', name: 'Steven & Karen Adams', email: 'adamsfamily@email.com', phone: '(555) 101-2020', address: '951 Redwood Ave', city: 'Round Rock', state: 'TX', zip: '78666', createdAt: '2024-06-05', totalJobs: 6, totalRevenue: 9600 },
  { id: 'CLT-021', name: "Lone Star Brewery", email: 'ops@lonestarbrew.com', phone: '(555) 101-2021', address: '400 Industrial Blvd', city: 'Austin', state: 'TX', zip: '73311', company: 'Lone Star Brewing Co', createdAt: '2024-06-12', totalJobs: 9, totalRevenue: 34000 },
  { id: 'CLT-022', name: 'Diana Foster', email: 'dfoster@email.com', phone: '(555) 101-2022', address: '633 Sycamore St', city: 'Pflugerville', state: 'TX', zip: '78662', createdAt: '2024-06-18', totalJobs: 3, totalRevenue: 4700 },
];

/* ── Team Members / Techs (5+) ── */
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'tech' | 'senior-tech' | 'lead-tech' | 'dispatcher' | 'admin';
  status: 'online' | 'busy' | 'away' | 'offline';
  activeJobs: number;
  completedToday: number;
  rating: number;
  specialties: string[];
  joinedAt: string;
}

export const teamMembers: TeamMember[] = [
  { id: 'TECH-001', name: 'James Wilson', email: 'jwilson@plumbcore.ai', phone: '(555) 200-1001', role: 'lead-tech', status: 'online', activeJobs: 2, completedToday: 4, rating: 4.9, specialties: ['Water Heaters', 'Sewer Lines', 'Gas Lines'], joinedAt: '2023-03-01' },
  { id: 'TECH-002', name: 'Mike Torres', email: 'mtorres@plumbcore.ai', phone: '(555) 200-1002', role: 'senior-tech', status: 'busy', activeJobs: 3, completedToday: 3, rating: 4.8, specialties: ['Drain Cleaning', 'Pipe Repair', 'Fixtures'], joinedAt: '2023-06-15' },
  { id: 'TECH-003', name: 'Carlos Ruiz', email: 'cruiz@plumbcore.ai', phone: '(555) 200-1003', role: 'senior-tech', status: 'away', activeJobs: 1, completedToday: 2, rating: 4.7, specialties: ['Water Heaters', 'Boilers', 'Radiant Heating'], joinedAt: '2023-09-01' },
  { id: 'TECH-004', name: 'Derek Chen', email: 'dchen@plumbcore.ai', phone: '(555) 200-1004', role: 'tech', status: 'online', activeJobs: 2, completedToday: 3, rating: 4.6, specialties: ['Drain Cleaning', 'Faucets', 'Toilets'], joinedAt: '2024-01-10' },
  { id: 'TECH-005', name: 'Sarah Blake', email: 'sblake@plumbcore.ai', phone: '(555) 200-1005', role: 'tech', status: 'online', activeJobs: 2, completedToday: 3, rating: 4.9, specialties: ['Gas Lines', 'Water Heaters', 'Sump Pumps'], joinedAt: '2024-02-20' },
  { id: 'TECH-006', name: 'Omar Hassan', email: 'ohassan@plumbcore.ai', phone: '(555) 200-1006', role: 'tech', status: 'busy', activeJobs: 3, completedToday: 2, rating: 4.5, specialties: ['Sewer Lines', 'Hydro Jetting', 'Camera Inspection'], joinedAt: '2024-04-05' },
];

/* ── Jobs (30+) ── */
export interface Job {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  status: JobStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string[];
  address: string;
  city: string;
  state: string;
  zip: string;
  scheduledDate: string;
  scheduledTime?: string;
  completedDate?: string;
  estimatedCost: number;
  actualCost?: number;
  materialsCost?: number;
  laborHours?: number;
  notes?: string;
  createdAt: string;
}

export const jobs: Job[] = [
  { id: 'JOB-001', clientId: 'CLT-001', clientName: 'James & Sarah Johnson', title: 'Main line repair', description: 'Main sewer line clogged, water backing up into basement. Needs urgent clearing and camera inspection.', status: 'completed', priority: 'urgent', assignedTo: ['TECH-001', 'TECH-004'], address: '123 Oak St', city: 'Austin', state: 'TX', zip: '73301', scheduledDate: '2024-06-10', completedDate: '2024-06-10', estimatedCost: 450, actualCost: 520, materialsCost: 180, laborHours: 3.5, createdAt: '2024-06-09' },
  { id: 'JOB-002', clientId: 'CLT-002', clientName: 'Robert Davis', title: 'Water heater install', description: 'Replace 50-gallon gas water heater. New unit: Bradford White 50-gal gas. Old unit failing, leaking.', status: 'completed', priority: 'high', assignedTo: ['TECH-003', 'TECH-005'], address: '456 Maple Ave', city: 'Austin', state: 'TX', zip: '73302', scheduledDate: '2024-06-11', completedDate: '2024-06-11', estimatedCost: 1200, actualCost: 1095, materialsCost: 670, laborHours: 4, createdAt: '2024-06-08' },
  { id: 'JOB-003', clientId: 'CLT-003', clientName: 'Maria Wilson', title: 'Leak detection & fix', description: 'Water stain on ceiling under bathroom. Needs leak detection and pipe repair.', status: 'scheduled', priority: 'medium', assignedTo: ['TECH-002'], address: '789 Pine Rd', city: 'Round Rock', state: 'TX', zip: '78664', scheduledDate: '2024-07-15', estimatedCost: 350, createdAt: '2024-07-10' },
  { id: 'JOB-004', clientId: 'CLT-004', clientName: 'Carlos Garcia', title: 'Sewer line backup', description: 'Emergency call - raw sewage backing up into floor drain. Immediate response needed.', status: 'in-progress', priority: 'urgent', assignedTo: ['TECH-001', 'TECH-006'], address: '321 Elm St', city: 'Austin', state: 'TX', zip: '73303', scheduledDate: '2024-07-12', estimatedCost: 650, createdAt: '2024-07-12' },
  { id: 'JOB-005', clientId: 'CLT-005', clientName: 'Emily Thompson', title: 'Faucet replacement', description: 'Replace kitchen faucet with new Moen single-handle model. Old faucet leaking under sink.', status: 'completed', priority: 'low', assignedTo: ['TECH-004'], address: '654 Birch Ln', city: 'Cedar Park', state: 'TX', zip: '78613', scheduledDate: '2024-06-12', completedDate: '2024-06-12', estimatedCost: 150, actualCost: 175, materialsCost: 110, laborHours: 1, createdAt: '2024-06-11' },
  { id: 'JOB-006', clientId: 'CLT-006', clientName: 'Michael Brown', title: 'Whole house repipe', description: 'Full repipe of 3-bedroom house. Replace all galvanized pipes with PEX. 2 bathrooms + kitchen.', status: 'in-progress', priority: 'high', assignedTo: ['TECH-001', 'TECH-002', 'TECH-005'], address: '987 Cedar Dr', city: 'Austin', state: 'TX', zip: '73304', scheduledDate: '2024-07-08', estimatedCost: 6500, createdAt: '2024-06-25' },
  { id: 'JOB-007', clientId: 'CLT-007', clientName: 'Patricia Martinez', title: 'Toilet replacement', description: 'Replace old toilet with new Toto Drake comfort-height model. Existing toilet cracked.', status: 'completed', priority: 'medium', assignedTo: ['TECH-004'], address: '246 Walnut Way', city: 'Pflugerville', state: 'TX', zip: '78660', scheduledDate: '2024-06-14', completedDate: '2024-06-14', estimatedCost: 380, actualCost: 395, materialsCost: 280, laborHours: 1.5, createdAt: '2024-06-13' },
  { id: 'JOB-008', clientId: 'CLT-008', clientName: 'David Anderson', title: 'Drain cleaning - kitchen', description: 'Kitchen sink drain severely clogged. Grease buildup. Need hydro jetting.', status: 'completed', priority: 'high', assignedTo: ['TECH-002', 'TECH-006'], address: '135 Spruce Ct', city: 'Austin', state: 'TX', zip: '73305', scheduledDate: '2024-06-15', completedDate: '2024-06-15', estimatedCost: 320, actualCost: 350, materialsCost: 40, laborHours: 2, createdAt: '2024-06-14' },
  { id: 'JOB-009', clientId: 'CLT-009', clientName: 'Linda Thomas', title: 'Gas line inspection', description: 'Annual gas line inspection for property. Check all gas appliances and lines for leaks.', status: 'scheduled', priority: 'low', assignedTo: ['TECH-005'], address: '753 Ash Blvd', city: 'Georgetown', state: 'TX', zip: '78626', scheduledDate: '2024-07-20', estimatedCost: 200, createdAt: '2024-07-05' },
  { id: 'JOB-010', clientId: 'CLT-010', clientName: 'Joseph White', title: 'Sump pump replacement', description: 'Sump pump failed. Basement flooding risk. Replace with new Zoeller 1/2 HP unit.', status: 'completed', priority: 'urgent', assignedTo: ['TECH-003'], address: '159 Poplar Ave', city: 'Austin', state: 'TX', zip: '73306', scheduledDate: '2024-06-18', completedDate: '2024-06-18', estimatedCost: 550, actualCost: 590, materialsCost: 320, laborHours: 2, createdAt: '2024-06-17' },
  { id: 'JOB-011', clientId: 'CLT-011', clientName: 'Oak Springs Apartments', title: 'Unit 204 - toilet leak', description: 'Tenant reports water leaking from toilet base onto bathroom floor. Wax ring likely failed.', status: 'completed', priority: 'high', assignedTo: ['TECH-004'], address: '4000 Spring Hollow Dr', city: 'Austin', state: 'TX', zip: '73307', scheduledDate: '2024-06-20', completedDate: '2024-06-20', estimatedCost: 180, actualCost: 165, materialsCost: 25, laborHours: 1, createdAt: '2024-06-19' },
  { id: 'JOB-012', clientId: 'CLT-011', clientName: 'Oak Springs Apartments', title: 'Building B - main water shutoff', description: 'Replace main water shutoff valve for Building B. Valve corroded and hard to turn.', status: 'scheduled', priority: 'high', assignedTo: ['TECH-001', 'TECH-002'], address: '4000 Spring Hollow Dr', city: 'Austin', state: 'TX', zip: '73307', scheduledDate: '2024-07-22', estimatedCost: 850, createdAt: '2024-07-15' },
  { id: 'JOB-013', clientId: 'CLT-012', clientName: 'Barbara Harris', title: 'Shower valve replacement', description: 'Shower diverter valve not working properly. Water only comes out of tub spout.', status: 'completed', priority: 'medium', assignedTo: ['TECH-004'], address: '852 Magnolia St', city: 'Round Rock', state: 'TX', zip: '78665', scheduledDate: '2024-06-22', completedDate: '2024-06-22', estimatedCost: 280, actualCost: 300, materialsCost: 140, laborHours: 2, createdAt: '2024-06-20' },
  { id: 'JOB-014', clientId: 'CLT-013', clientName: 'Main Street Diner', title: 'Commercial grease trap cleaning', description: 'Monthly grease trap maintenance. Kitchen drain slow - grease buildup in trap and lines.', status: 'completed', priority: 'high', assignedTo: ['TECH-002', 'TECH-006'], address: '100 Main St', city: 'Austin', state: 'TX', zip: '73301', scheduledDate: '2024-06-25', completedDate: '2024-06-25', estimatedCost: 450, actualCost: 480, materialsCost: 60, laborHours: 3, createdAt: '2024-06-20' },
  { id: 'JOB-015', clientId: 'CLT-013', clientName: 'Main Street Diner', title: 'Dishwasher drain line replacement', description: 'Commercial dishwasher drain line corroded and leaking. Replace with new PVC run.', status: 'in-progress', priority: 'medium', assignedTo: ['TECH-002'], address: '100 Main St', city: 'Austin', state: 'TX', zip: '73301', scheduledDate: '2024-07-14', estimatedCost: 600, createdAt: '2024-07-10' },
  { id: 'JOB-016', clientId: 'CLT-014', clientName: 'Thomas Clark', title: 'Water pressure issue', description: 'Low water pressure throughout house. Suspect pressure regulator or partial pipe blockage.', status: 'scheduled', priority: 'medium', assignedTo: ['TECH-001'], address: '369 Hickory Ln', city: 'Pflugerville', state: 'TX', zip: '78661', scheduledDate: '2024-07-25', estimatedCost: 300, createdAt: '2024-07-18' },
  { id: 'JOB-017', clientId: 'CLT-015', clientName: 'Sunset Retirement Home', title: 'Emergency pipe burst - Building A', description: 'Pipe burst in common room ceiling. Shut off water to Building A. Need immediate repair.', status: 'in-progress', priority: 'urgent', assignedTo: ['TECH-001', 'TECH-003', 'TECH-005'], address: '500 Sunset Blvd', city: 'Austin', state: 'TX', zip: '73308', scheduledDate: '2024-07-12', estimatedCost: 2800, createdAt: '2024-07-12' },
  { id: 'JOB-018', clientId: 'CLT-015', clientName: 'Sunset Retirement Home', title: 'Quarterly backflow prevention testing', description: 'Annual backflow prevention device testing for all 4 buildings. Required by city code.', status: 'scheduled', priority: 'medium', assignedTo: ['TECH-005'], address: '500 Sunset Blvd', city: 'Austin', state: 'TX', zip: '73308', scheduledDate: '2024-08-01', estimatedCost: 1200, createdAt: '2024-07-10' },
  { id: 'JOB-019', clientId: 'CLT-016', clientName: 'Kevin Robinson', title: 'New bathroom rough-in', description: 'Rough-in plumbing for new bathroom in finished basement. Includes toilet, sink, shower drain.', status: 'scheduled', priority: 'low', assignedTo: ['TECH-001', 'TECH-003'], address: '741 Chestnut Ct', city: 'Cedar Park', state: 'TX', zip: '78614', scheduledDate: '2024-07-28', estimatedCost: 3200, createdAt: '2024-07-05' },
  { id: 'JOB-020', clientId: 'CLT-017', clientName: 'Riverside Church', title: 'Restroom renovation plumbing', description: 'Full plumbing for restroom renovation. 4 toilets, 4 sinks, 2 urinals. Commercial grade fixtures.', status: 'in-progress', priority: 'high', assignedTo: ['TECH-001', 'TECH-002', 'TECH-003'], address: '200 River Rd', city: 'Austin', state: 'TX', zip: '73309', scheduledDate: '2024-07-08', estimatedCost: 8500, createdAt: '2024-06-20' },
  { id: 'JOB-021', clientId: 'CLT-018', clientName: 'Nancy Lee', title: 'Garbage disposal replacement', description: 'Replace InSinkErator garbage disposal. Unit jammed and burned out motor.', status: 'completed', priority: 'medium', assignedTo: ['TECH-004'], address: '258 Willow Dr', city: 'Georgetown', state: 'TX', zip: '78627', scheduledDate: '2024-07-01', completedDate: '2024-07-01', estimatedCost: 250, actualCost: 275, materialsCost: 160, laborHours: 1, createdAt: '2024-06-28' },
  { id: 'JOB-022', clientId: 'CLT-019', clientName: 'TechHub Office Park', title: 'Floor 2 restroom - clogged toilets', description: 'Multiple toilets on Floor 2 not flushing properly. Main line blockage suspected.', status: 'completed', priority: 'high', assignedTo: ['TECH-002', 'TECH-006'], address: '300 Innovation Way', city: 'Austin', state: 'TX', zip: '73310', scheduledDate: '2024-07-02', completedDate: '2024-07-02', estimatedCost: 500, actualCost: 550, materialsCost: 80, laborHours: 3, createdAt: '2024-07-01' },
  { id: 'JOB-023', clientId: 'CLT-019', clientName: 'TechHub Office Park', title: 'Cooling tower water treatment line repair', description: 'Water treatment chemical feed line leaking. PVC pipe cracked near cooling tower.', status: 'scheduled', priority: 'medium', assignedTo: ['TECH-003'], address: '300 Innovation Way', city: 'Austin', state: 'TX', zip: '73310', scheduledDate: '2024-07-26', estimatedCost: 750, createdAt: '2024-07-20' },
  { id: 'JOB-024', clientId: 'CLT-020', clientName: 'Steven & Karen Adams', title: 'Outdoor spigot install', description: 'Install new frost-free outdoor spigot on back patio. Tap into existing line in crawl space.', status: 'completed', priority: 'low', assignedTo: ['TECH-004'], address: '951 Redwood Ave', city: 'Round Rock', state: 'TX', zip: '78666', scheduledDate: '2024-07-05', completedDate: '2024-07-05', estimatedCost: 220, actualCost: 250, materialsCost: 85, laborHours: 2, createdAt: '2024-07-03' },
  { id: 'JOB-025', clientId: 'CLT-021', clientName: 'Lone Star Brewery', title: 'Brewery floor drain maintenance', description: 'Main production floor drains slow due to sediment and hop residue buildup. Need hydro jetting.', status: 'scheduled', priority: 'high', assignedTo: ['TECH-002', 'TECH-006'], address: '400 Industrial Blvd', city: 'Austin', state: 'TX', zip: '73311', scheduledDate: '2024-07-30', estimatedCost: 950, createdAt: '2024-07-22' },
  { id: 'JOB-026', clientId: 'CLT-021', clientName: 'Lone Star Brewery', title: 'Hot water recirculation pump replacement', description: 'Recirculation pump for hot water loop failed. Rating at 1.5 HP. Need commercial grade replacement.', status: 'in-progress', priority: 'high', assignedTo: ['TECH-003', 'TECH-005'], address: '400 Industrial Blvd', city: 'Austin', state: 'TX', zip: '73311', scheduledDate: '2024-07-15', estimatedCost: 1800, createdAt: '2024-07-10' },
  { id: 'JOB-027', clientId: 'CLT-022', clientName: 'Diana Foster', title: 'Bathroom sink drain repair', description: 'Sink drain pipe under cabinet leaking at P-trap connection. PVC joint failed.', status: 'completed', priority: 'low', assignedTo: ['TECH-004'], address: '633 Sycamore St', city: 'Pflugerville', state: 'TX', zip: '78662', scheduledDate: '2024-07-08', completedDate: '2024-07-08', estimatedCost: 130, actualCost: 145, materialsCost: 25, laborHours: 1, createdAt: '2024-07-07' },
  { id: 'JOB-028', clientId: 'CLT-003', clientName: 'Maria Wilson', title: 'Tankless water heater flush', description: 'Annual descaling and flush of Navien tankless water heater. Prevent mineral buildup.', status: 'scheduled', priority: 'low', assignedTo: ['TECH-003'], address: '789 Pine Rd', city: 'Round Rock', state: 'TX', zip: '78664', scheduledDate: '2024-08-05', estimatedCost: 200, createdAt: '2024-07-25' },
  { id: 'JOB-029', clientId: 'CLT-006', clientName: 'Michael Brown', title: 'Outdoor shower plumbing', description: 'Run hot/cold water lines to new outdoor shower on back deck. Include freeze-proof valve.', status: 'scheduled', priority: 'low', assignedTo: ['TECH-001'], address: '987 Cedar Dr', city: 'Austin', state: 'TX', zip: '73304', scheduledDate: '2024-08-10', estimatedCost: 1400, createdAt: '2024-07-28' },
  { id: 'JOB-030', clientId: 'CLT-009', clientName: 'Linda Thomas', title: 'Water softener install', description: 'Install whole-house water softener in garage. Include bypass loop and drain line.', status: 'scheduled', priority: 'medium', assignedTo: ['TECH-001', 'TECH-005'], address: '753 Ash Blvd', city: 'Georgetown', state: 'TX', zip: '78626', scheduledDate: '2024-08-12', estimatedCost: 1100, createdAt: '2024-07-30' },
  { id: 'JOB-031', clientId: 'CLT-015', clientName: 'Sunset Retirement Home', title: 'Building C - water heater bank inspection', description: 'Inspect bank of 4 commercial water heaters. One unit showing error code. Diagnose and repair.', status: 'scheduled', priority: 'high', assignedTo: ['TECH-003', 'TECH-005'], address: '500 Sunset Blvd', city: 'Austin', state: 'TX', zip: '73308', scheduledDate: '2024-08-03', estimatedCost: 600, createdAt: '2024-07-28' },
];

/* ── Invoices (15+) ── */
export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  jobId: string;
  jobTitle: string;
  status: InvoiceStatus;
  amount: number;
  paidAmount?: number;
  dueDate: string;
  issueDate: string;
  paidDate?: string;
  paymentMethod?: PaymentMethod;
  lineItems: { description: string; quantity: number; unitPrice: number; total: number }[];
  notes?: string;
}

export const invoices: Invoice[] = [
  { id: 'INV-001', clientId: 'CLT-001', clientName: 'James & Sarah Johnson', jobId: 'JOB-001', jobTitle: 'Main line repair', status: 'paid', amount: 520, paidAmount: 520, dueDate: '2024-07-10', issueDate: '2024-06-10', paidDate: '2024-06-25', paymentMethod: 'credit_card', lineItems: [{ description: 'Sewer line clearing - hydro jet', quantity: 1, unitPrice: 340, total: 340 }, { description: 'Camera inspection', quantity: 1, unitPrice: 100, total: 100 }, { description: 'Materials - PVC fittings, glue', quantity: 1, unitPrice: 80, total: 80 }] },
  { id: 'INV-002', clientId: 'CLT-002', clientName: 'Robert Davis', jobId: 'JOB-002', jobTitle: 'Water heater install', status: 'paid', amount: 1095, paidAmount: 1095, dueDate: '2024-07-11', issueDate: '2024-06-11', paidDate: '2024-07-01', paymentMethod: 'check', lineItems: [{ description: 'Bradford White 50-gal gas water heater', quantity: 1, unitPrice: 670, total: 670 }, { description: 'Installation labor', quantity: 4, unitPrice: 85, total: 340 }, { description: 'Permit fee', quantity: 1, unitPrice: 85, total: 85 }] },
  { id: 'INV-003', clientId: 'CLT-005', clientName: 'Emily Thompson', jobId: 'JOB-005', jobTitle: 'Faucet replacement', status: 'paid', amount: 175, paidAmount: 175, dueDate: '2024-07-12', issueDate: '2024-06-12', paidDate: '2024-06-28', paymentMethod: 'credit_card', lineItems: [{ description: 'Moen One-Handle kitchen faucet', quantity: 1, unitPrice: 110, total: 110 }, { description: 'Labor - removal & install', quantity: 1, unitPrice: 65, total: 65 }] },
  { id: 'INV-004', clientId: 'CLT-007', clientName: 'Patricia Martinez', jobId: 'JOB-007', jobTitle: 'Toilet replacement', status: 'paid', amount: 395, paidAmount: 395, dueDate: '2024-07-14', issueDate: '2024-06-14', paidDate: '2024-06-30', paymentMethod: 'credit_card', lineItems: [{ description: 'Toto Drake comfort-height toilet', quantity: 1, unitPrice: 280, total: 280 }, { description: 'Labor - removal & install', quantity: 1.5, unitPrice: 76.67, total: 115 }] },
  { id: 'INV-005', clientId: 'CLT-008', clientName: 'David Anderson', jobId: 'JOB-008', jobTitle: 'Drain cleaning - kitchen', status: 'paid', amount: 350, paidAmount: 350, dueDate: '2024-07-15', issueDate: '2024-06-15', paidDate: '2024-07-05', paymentMethod: 'check', lineItems: [{ description: 'Kitchen drain hydro jetting', quantity: 1, unitPrice: 250, total: 250 }, { description: 'Drain snake fee', quantity: 1, unitPrice: 60, total: 60 }, { description: 'Disposal fee - grease', quantity: 1, unitPrice: 40, total: 40 }] },
  { id: 'INV-006', clientId: 'CLT-010', clientName: 'Joseph White', jobId: 'JOB-010', jobTitle: 'Sump pump replacement', status: 'paid', amount: 590, paidAmount: 590, dueDate: '2024-07-18', issueDate: '2024-06-18', paidDate: '2024-07-08', paymentMethod: 'credit_card', lineItems: [{ description: 'Zoeller 1/2 HP sump pump', quantity: 1, unitPrice: 320, total: 320 }, { description: 'Labor - removal & install', quantity: 2, unitPrice: 85, total: 170 }, { description: 'Check valve & fittings', quantity: 1, unitPrice: 100, total: 100 }] },
  { id: 'INV-007', clientId: 'CLT-011', clientName: 'Oak Springs Apartments', jobId: 'JOB-011', jobTitle: 'Unit 204 - toilet leak', status: 'paid', amount: 165, paidAmount: 165, dueDate: '2024-07-20', issueDate: '2024-06-20', paidDate: '2024-07-10', paymentMethod: 'bank_transfer', lineItems: [{ description: 'Wax ring & toilet reseal', quantity: 1, unitPrice: 25, total: 25 }, { description: 'Labor', quantity: 1, unitPrice: 140, total: 140 }] },
  { id: 'INV-008', clientId: 'CLT-012', clientName: 'Barbara Harris', jobId: 'JOB-013', jobTitle: 'Shower valve replacement', status: 'paid', amount: 300, paidAmount: 300, dueDate: '2024-07-22', issueDate: '2024-06-22', paidDate: '2024-07-12', paymentMethod: 'credit_card', lineItems: [{ description: 'Moen shower valve cartridge', quantity: 1, unitPrice: 90, total: 90 }, { description: 'Trim kit', quantity: 1, unitPrice: 50, total: 50 }, { description: 'Labor - valve replacement', quantity: 2, unitPrice: 80, total: 160 }] },
  { id: 'INV-009', clientId: 'CLT-013', clientName: 'Main Street Diner', jobId: 'JOB-014', jobTitle: 'Grease trap cleaning', status: 'paid', amount: 480, paidAmount: 480, dueDate: '2024-07-25', issueDate: '2024-06-25', paidDate: '2024-07-15', paymentMethod: 'check', lineItems: [{ description: 'Grease trap clean & pump out', quantity: 1, unitPrice: 300, total: 300 }, { description: 'Grease disposal fee', quantity: 1, unitPrice: 80, total: 80 }, { description: 'Line jetting', quantity: 1, unitPrice: 100, total: 100 }] },
  { id: 'INV-010', clientId: 'CLT-018', clientName: 'Nancy Lee', jobId: 'JOB-021', jobTitle: 'Garbage disposal replacement', status: 'paid', amount: 275, paidAmount: 275, dueDate: '2024-08-01', issueDate: '2024-07-01', paidDate: '2024-07-20', paymentMethod: 'credit_card', lineItems: [{ description: 'InSinkErator Evolution Compact', quantity: 1, unitPrice: 160, total: 160 }, { description: 'Labor - removal & install', quantity: 1, unitPrice: 115, total: 115 }] },
  { id: 'INV-011', clientId: 'CLT-019', clientName: 'TechHub Office Park', jobId: 'JOB-022', jobTitle: 'Floor 2 restroom - clogged toilets', status: 'paid', amount: 550, paidAmount: 550, dueDate: '2024-08-02', issueDate: '2024-07-02', paidDate: '2024-07-22', paymentMethod: 'bank_transfer', lineItems: [{ description: 'Main line unclogging', quantity: 1, unitPrice: 350, total: 350 }, { description: 'Camera inspection', quantity: 1, unitPrice: 120, total: 120 }, { description: 'Materials', quantity: 1, unitPrice: 80, total: 80 }] },
  { id: 'INV-012', clientId: 'CLT-020', clientName: 'Steven & Karen Adams', jobId: 'JOB-024', jobTitle: 'Outdoor spigot install', status: 'paid', amount: 250, paidAmount: 250, dueDate: '2024-08-05', issueDate: '2024-07-05', paidDate: '2024-07-25', paymentMethod: 'credit_card', lineItems: [{ description: 'Frost-free spigot', quantity: 1, unitPrice: 45, total: 45 }, { description: 'PEX pipe & fittings', quantity: 1, unitPrice: 40, total: 40 }, { description: 'Labor', quantity: 2, unitPrice: 82.50, total: 165 }] },
  { id: 'INV-013', clientId: 'CLT-022', clientName: 'Diana Foster', jobId: 'JOB-027', jobTitle: 'Bathroom sink drain repair', status: 'sent', amount: 145, dueDate: '2024-08-08', issueDate: '2024-07-08', lineItems: [{ description: 'PVC P-trap & fittings', quantity: 1, unitPrice: 25, total: 25 }, { description: 'Labor - repair', quantity: 1, unitPrice: 120, total: 120 }] },
  { id: 'INV-014', clientId: 'CLT-003', clientName: 'Maria Wilson', jobId: 'JOB-003', jobTitle: 'Leak detection & fix', status: 'draft', amount: 350, dueDate: '2024-08-15', issueDate: '2024-07-15', lineItems: [{ description: 'Leak detection service', quantity: 1, unitPrice: 150, total: 150 }, { description: 'Pipe repair', quantity: 1, unitPrice: 200, total: 200 }] },
  { id: 'INV-015', clientId: 'CLT-004', clientName: 'Carlos Garcia', jobId: 'JOB-004', jobTitle: 'Sewer line backup', status: 'draft', amount: 650, dueDate: '2024-08-12', issueDate: '2024-07-12', lineItems: [{ description: 'Emergency sewer line clearing', quantity: 1, unitPrice: 450, total: 450 }, { description: 'Camera inspection', quantity: 1, unitPrice: 120, total: 120 }, { description: 'Materials', quantity: 1, unitPrice: 80, total: 80 }] },
  { id: 'INV-016', clientId: 'CLT-006', clientName: 'Michael Brown', jobId: 'JOB-006', jobTitle: 'Whole house repipe', status: 'draft', amount: 6500, dueDate: '2024-09-08', issueDate: '2024-07-08', lineItems: [{ description: 'PEX tubing & fittings - whole house', quantity: 1, unitPrice: 2800, total: 2800 }, { description: 'Labor - 3 techs, 4 days', quantity: 96, unitPrice: 35, total: 3360 }, { description: 'Permit & inspection fees', quantity: 1, unitPrice: 340, total: 340 }] },
  { id: 'INV-017', clientId: 'CLT-017', clientName: 'Riverside Church', jobId: 'JOB-020', jobTitle: 'Restroom renovation plumbing', status: 'sent', amount: 8500, dueDate: '2024-09-08', issueDate: '2024-07-08', lineItems: [{ description: 'Commercial fixtures (4 toilets, 4 sinks, 2 urinals)', quantity: 1, unitPrice: 4200, total: 4200 }, { description: 'Rough-in labor & installation', quantity: 1, unitPrice: 3800, total: 3800 }, { description: 'Permit fees', quantity: 1, unitPrice: 500, total: 500 }] },
];

/* ── Inventory (24+) ── */
export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  sku: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  supplier: string;
  location: string;
  description: string;
}

export const inventory: InventoryItem[] = [
  { id: 'INV-ITM-001', name: '1/2" PEX Tubing (100ft roll)', category: 'pipe', sku: 'PEX-12-100', quantity: 15, minQuantity: 5, unitPrice: 45, supplier: 'SupplyHouse.com', location: 'Bay A-1', description: 'Uponor 1/2" PEX tubing, 100ft roll, red' },
  { id: 'INV-ITM-002', name: '3/4" PEX Tubing (100ft roll)', category: 'pipe', sku: 'PEX-34-100', quantity: 12, minQuantity: 5, unitPrice: 62, supplier: 'SupplyHouse.com', location: 'Bay A-1', description: 'Uponor 3/4" PEX tubing, 100ft roll, blue' },
  { id: 'INV-ITM-003', name: '1" PVC Schedule 40 Pipe (10ft)', category: 'pipe', sku: 'PVC-1-10', quantity: 25, minQuantity: 10, unitPrice: 8, supplier: 'Ferguson Plumbing', location: 'Bay A-2', description: '1" Schedule 40 PVC pipe, 10ft length' },
  { id: 'INV-ITM-004', name: '2" PVC Schedule 40 Pipe (10ft)', category: 'pipe', sku: 'PVC-2-10', quantity: 18, minQuantity: 8, unitPrice: 14, supplier: 'Ferguson Plumbing', location: 'Bay A-2', description: '2" Schedule 40 PVC pipe, 10ft length' },
  { id: 'INV-ITM-005', name: '3/4" Copper Type L Pipe (10ft)', category: 'pipe', sku: 'COP-34-10', quantity: 8, minQuantity: 4, unitPrice: 28, supplier: 'Ferguson Plumbing', location: 'Bay A-3', description: '3/4" Type L rigid copper pipe, 10ft' },
  { id: 'INV-ITM-006', name: '1/2" PEX Crimp Rings (100pk)', category: 'fitting', sku: 'FIT-PEX-CR12', quantity: 20, minQuantity: 10, unitPrice: 12, supplier: 'SupplyHouse.com', location: 'Bay B-1', description: 'Uponor 1/2" PEX cinch clamp rings, 100-pack' },
  { id: 'INV-ITM-007', name: '3/4" PEX Crimp Rings (100pk)', category: 'fitting', sku: 'FIT-PEX-CR34', quantity: 15, minQuantity: 10, unitPrice: 15, supplier: 'SupplyHouse.com', location: 'Bay B-1', description: 'Uponor 3/4" PEX cinch clamp rings, 100-pack' },
  { id: 'INV-ITM-008', name: '1/2" Brass PEX Fitting - Coupling', category: 'fitting', sku: 'FIT-BRZ-12CP', quantity: 50, minQuantity: 20, unitPrice: 3, supplier: 'SupplyHouse.com', location: 'Bay B-2', description: '1/2" brass PEX coupling' },
  { id: 'INV-ITM-009', name: '3/4" Brass PEX Fitting - 90° Elbow', category: 'fitting', sku: 'FIT-BRZ-34EL', quantity: 40, minQuantity: 15, unitPrice: 4, supplier: 'SupplyHouse.com', location: 'Bay B-2', description: '3/4" brass PEX 90-degree elbow' },
  { id: 'INV-ITM-010', name: '1/2" SharkBite Push-to-Connect Coupling', category: 'fitting', sku: 'FIT-SHK-12CP', quantity: 30, minQuantity: 10, unitPrice: 7, supplier: 'Ferguson Plumbing', location: 'Bay B-3', description: 'SharkBite 1/2" push-to-connect coupling' },
  { id: 'INV-ITM-011', name: '3/4" Ball Valve - Full Port Brass', category: 'valve', sku: 'VAL-BRZ-34FP', quantity: 22, minQuantity: 10, unitPrice: 18, supplier: 'Ferguson Plumbing', location: 'Bay C-1', description: '3/4" full port brass ball valve with threaded ends' },
  { id: 'INV-ITM-012', name: '1" Ball Valve - Full Port Brass', category: 'valve', sku: 'VAL-BRZ-1FP', quantity: 14, minQuantity: 5, unitPrice: 24, supplier: 'Ferguson Plumbing', location: 'Bay C-1', description: '1" full port brass ball valve with threaded ends' },
  { id: 'INV-ITM-013', name: 'Water Pressure Regulator 3/4"', category: 'valve', sku: 'VAL-PR-34', quantity: 8, minQuantity: 3, unitPrice: 55, supplier: 'SupplyHouse.com', location: 'Bay C-2', description: '3/4" adjustable water pressure reducing valve' },
  { id: 'INV-ITM-014', name: 'Toto Drake Complete Toilet', category: 'fixture', sku: 'FIX-TOTO-DRK', quantity: 6, minQuantity: 3, unitPrice: 280, supplier: 'Ferguson Plumbing', location: 'Bay D-1', description: 'Toto Drake CST454CEFG, comfort height, cotton white' },
  { id: 'INV-ITM-015', name: 'Moen One-Handle Kitchen Faucet', category: 'fixture', sku: 'FIX-MOEN-KF', quantity: 10, minQuantity: 5, unitPrice: 110, supplier: 'Ferguson Plumbing', location: 'Bay D-2', description: 'Moen 7594ESRS Arsley one-handle kitchen faucet, stainless' },
  { id: 'INV-ITM-016', name: 'Bradford White 50-gal Gas Water Heater', category: 'heater', sku: 'HWT-BW-50G', quantity: 4, minQuantity: 2, unitPrice: 670, supplier: 'Ferguson Plumbing', location: 'Bay E-1', description: 'Bradford White RG250T6N 50-gal gas water heater' },
  { id: 'INV-ITM-017', name: 'Navien 240E Tankless Water Heater', category: 'heater', sku: 'HWT-NVN-240E', quantity: 2, minQuantity: 1, unitPrice: 1200, supplier: 'SupplyHouse.com', location: 'Bay E-1', description: 'Navien NPE-240E condensing tankless water heater' },
  { id: 'INV-ITM-018', name: 'Zoeller 1/2 HP Sump Pump', category: 'pump', sku: 'PMP-ZL-12HP', quantity: 5, minQuantity: 2, unitPrice: 320, supplier: 'Ferguson Plumbing', location: 'Bay F-1', description: 'Zoeller M53 1/2 HP submersible sump pump' },
  { id: 'INV-ITM-019', name: 'InSinkErator Evolution Compact Disposal', category: 'fixture', sku: 'FIX-DSP-ECOMP', quantity: 8, minQuantity: 3, unitPrice: 160, supplier: 'SupplyHouse.com', location: 'Bay D-2', description: 'InSinkErator Evolution Compact 3/4 HP garbage disposal' },
  { id: 'INV-ITM-020', name: 'Milwaukee M18 ProPEX Expansion Tool', category: 'tool', sku: 'TOL-MIL-PEX', quantity: 3, minQuantity: 1, unitPrice: 450, supplier: 'SupplyHouse.com', location: 'Bay T-1', description: 'Milwaukee 2674-20 M18 ProPEX expansion tool' },
  { id: 'INV-ITM-021', name: 'Ridgid K-60 Drain Cleaning Machine', category: 'tool', sku: 'TOL-RGD-K60', quantity: 4, minQuantity: 1, unitPrice: 850, supplier: 'Ferguson Plumbing', location: 'Bay T-2', description: 'Ridgid K-60 3/4 HP drain cleaning machine with cables' },
  { id: 'INV-ITM-022', name: 'Oatey PVC Cement (1qt)', category: 'sealant', sku: 'SL-OAT-1QT', quantity: 30, minQuantity: 10, unitPrice: 12, supplier: 'Ferguson Plumbing', location: 'Bay G-1', description: 'Oatey 30169 PVC cement, clear, 1 quart' },
  { id: 'INV-ITM-023', name: 'Oatey PVC Primer (1qt)', category: 'sealant', sku: 'SL-OAT-PRM1QT', quantity: 25, minQuantity: 10, unitPrice: 10, supplier: 'Ferguson Plumbing', location: 'Bay G-1', description: 'Oatey 30167 PVC purple primer, 1 quart' },
  { id: 'INV-ITM-024', name: 'Teflon Tape (1/2" x 260ft)', category: 'sealant', sku: 'SL-TFL-12-260', quantity: 60, minQuantity: 20, unitPrice: 3, supplier: 'SupplyHouse.com', location: 'Bay G-2', description: 'Professional grade PTFE thread seal tape, 260ft roll' },
];

/* ── Suppliers ── */
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  categories: string[];
}

export const suppliers: Supplier[] = [
  { id: 'SUP-001', name: 'SupplyHouse.com', contactPerson: 'Alex Turner', phone: '(800) 555-0101', email: 'alex@supplyhouse.com', address: '200 Commerce Way, Chicago, IL 60601', categories: ['Pipe', 'Fitting', 'Valve', 'Heater', 'Tool', 'Sealant'] },
  { id: 'SUP-002', name: 'Ferguson Plumbing', contactPerson: 'Maria Santos', phone: '(800) 555-0102', email: 'maria@ferguson.com', address: '150 Industrial Park Dr, Dallas, TX 75201', categories: ['Pipe', 'Fitting', 'Valve', 'Fixture', 'Pump', 'Tool', 'Sealant'] },
  { id: 'SUP-003', name: 'Home Depot Pro', contactPerson: 'John Ramirez', phone: '(800) 555-0103', email: 'john@homedepot.com', address: '500 Retail Row, Austin, TX 73301', categories: ['Pipe', 'Fitting', 'Fixture', 'Tool'] },
  { id: 'SUP-004', name: 'Grainger Industrial', contactPerson: 'Sarah Chen', phone: '(800) 555-0104', email: 'schen@grainger.com', address: '750 Supply Blvd, Houston, TX 77001', categories: ['Tool', 'Valve', 'Pump', 'Sealant'] },
  { id: 'SUP-005', name: 'McMaster-Carr', contactPerson: 'David Park', phone: '(800) 555-0105', email: 'dpark@mcmaster.com', address: '600 Industrial Ave, Elmhurst, IL 60126', categories: ['Pipe', 'Fitting', 'Valve', 'Tool', 'Sealant'] },
  { id: 'SUP-006', name: 'Winzer Corp', contactPerson: 'Lisa Brown', phone: '(800) 555-0106', email: 'lbrown@winzer.com', address: '300 Manufacturing Dr, Detroit, MI 48201', categories: ['Valve', 'Heater', 'Pump'] },
];

/* ── Inventory Transactions ── */
export interface InventoryTransaction {
  id: string;
  itemId: string;
  date: string;
  type: TransactionType;
  quantity: number;
  note: string;
}

export const inventoryTransactions: InventoryTransaction[] = [
  { id: 'TXN-001', itemId: 'INV-ITM-001', date: '2024-07-10', type: 'Used', quantity: -2, note: 'Used for Job JOB-020 - Restroom renovation' },
  { id: 'TXN-002', itemId: 'INV-ITM-001', date: '2024-07-08', type: 'Received', quantity: 10, note: 'Restock from SupplyHouse.com' },
  { id: 'TXN-003', itemId: 'INV-ITM-001', date: '2024-07-05', type: 'Used', quantity: -3, note: 'Used for Job JOB-006 - Whole house repipe' },
  { id: 'TXN-004', itemId: 'INV-ITM-001', date: '2024-06-28', type: 'Used', quantity: -1, note: 'Used for Job JOB-012 - Building B shutoff' },
  { id: 'TXN-005', itemId: 'INV-ITM-001', date: '2024-06-20', type: 'Adjusted', quantity: -1, note: 'Inventory adjustment - damaged roll' },
  { id: 'TXN-006', itemId: 'INV-ITM-002', date: '2024-07-12', type: 'Used', quantity: -2, note: 'Used for Job JOB-020 - Restroom renovation' },
  { id: 'TXN-007', itemId: 'INV-ITM-002', date: '2024-07-09', type: 'Used', quantity: -1, note: 'Used for Job JOB-015 - Dishwasher drain' },
  { id: 'TXN-008', itemId: 'INV-ITM-002', date: '2024-07-01', type: 'Received', quantity: 5, note: 'Restock from SupplyHouse.com' },
  { id: 'TXN-009', itemId: 'INV-ITM-002', date: '2024-06-25', type: 'Used', quantity: -3, note: 'Used for Job JOB-006 - Whole house repipe' },
  { id: 'TXN-010', itemId: 'INV-ITM-002', date: '2024-06-15', type: 'Used', quantity: -1, note: 'Used for Job JOB-017 - Pipe burst repair' },
  { id: 'TXN-011', itemId: 'INV-ITM-016', date: '2024-07-11', type: 'Used', quantity: -1, note: 'Used for Job JOB-002 - Water heater install' },
  { id: 'TXN-012', itemId: 'INV-ITM-016', date: '2024-06-20', type: 'Received', quantity: 3, note: 'Restock from Ferguson' },
  { id: 'TXN-013', itemId: 'INV-ITM-016', date: '2024-06-10', type: 'Used', quantity: -1, note: 'Used for Job JOB-002 - Water heater install' },
  { id: 'TXN-014', itemId: 'INV-ITM-016', date: '2024-05-28', type: 'Used', quantity: -1, note: 'Used for Job JOB-026 - Recirc pump replacement' },
  { id: 'TXN-015', itemId: 'INV-ITM-016', date: '2024-05-15', type: 'Adjusted', quantity: 1, note: 'Return from job site - unused' },
  { id: 'TXN-016', itemId: 'INV-ITM-017', date: '2024-07-10', type: 'Used', quantity: -1, note: 'Used for Job JOB-028 - Tankless flush' },
  { id: 'TXN-017', itemId: 'INV-ITM-017', date: '2024-06-15', type: 'Received', quantity: 2, note: 'Restock from SupplyHouse.com' },
  { id: 'TXN-018', itemId: 'INV-ITM-017', date: '2024-06-01', type: 'Used', quantity: -1, note: 'Used for new install at Johnson residence' },
  { id: 'TXN-019', itemId: 'INV-ITM-014', date: '2024-07-05', type: 'Used', quantity: -1, note: 'Used for Job JOB-007 - Toilet replacement' },
  { id: 'TXN-020', itemId: 'INV-ITM-014', date: '2024-06-20', type: 'Received', quantity: 3, note: 'Restock from Ferguson' },
  { id: 'TXN-021', itemId: 'INV-ITM-014', date: '2024-06-10', type: 'Used', quantity: -1, note: 'Used for Martinez toilet replacement' },
  { id: 'TXN-022', itemId: 'INV-ITM-020', date: '2024-07-08', type: 'Used', quantity: -1, note: 'Borrowed by TECH-001 for Job JOB-006' },
  { id: 'TXN-023', itemId: 'INV-ITM-020', date: '2024-06-28', type: 'Received', quantity: 1, note: 'Returned from TECH-003' },
  { id: 'TXN-024', itemId: 'INV-ITM-020', date: '2024-06-15', type: 'Used', quantity: -1, note: 'Checked out by TECH-001' },
  { id: 'TXN-025', itemId: 'INV-ITM-011', date: '2024-07-14', type: 'Used', quantity: -2, note: 'Used for Job JOB-012 - Building B shutoff' },
  { id: 'TXN-026', itemId: 'INV-ITM-011', date: '2024-07-01', type: 'Received', quantity: 5, note: 'Restock from Ferguson' },
  { id: 'TXN-027', itemId: 'INV-ITM-024', date: '2024-07-10', type: 'Used', quantity: -5, note: 'Used across multiple jobs this week' },
  { id: 'TXN-028', itemId: 'INV-ITM-024', date: '2024-07-01', type: 'Received', quantity: 20, note: 'Bulk restock from SupplyHouse.com' },
];

/* ── Purchase Orders ── */
export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: { itemId: string; itemName: string; quantity: number; unitPrice: number; total: number }[];
  itemsCount: number;
  total: number;
  status: POStatus;
  expectedDelivery: string;
  notes: string;
  createdAt: string;
  sentDate?: string;
  receivedDate?: string;
  cancelledDate?: string;
}

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-001', poNumber: 'PO-2024-001', supplierId: 'SUP-001', supplierName: 'SupplyHouse.com',
    items: [
      { itemId: 'INV-ITM-001', itemName: '1/2" PEX Tubing (100ft roll)', quantity: 5, unitPrice: 42, total: 210 },
      { itemId: 'INV-ITM-006', itemName: '1/2" PEX Crimp Rings (100pk)', quantity: 3, unitPrice: 11, total: 33 },
    ],
    itemsCount: 2, total: 243, status: 'Received', expectedDelivery: '2024-07-20', notes: 'Regular monthly restock',
    createdAt: '2024-07-15', sentDate: '2024-07-15', receivedDate: '2024-07-19',
  },
  {
    id: 'PO-002', poNumber: 'PO-2024-002', supplierId: 'SUP-002', supplierName: 'Ferguson Plumbing',
    items: [
      { itemId: 'INV-ITM-016', itemName: 'Bradford White 50-gal Gas Water Heater', quantity: 2, unitPrice: 650, total: 1300 },
      { itemId: 'INV-ITM-014', itemName: 'Toto Drake Complete Toilet', quantity: 3, unitPrice: 275, total: 825 },
    ],
    itemsCount: 2, total: 2125, status: 'Sent', expectedDelivery: '2024-08-01', notes: 'Restock for upcoming jobs',
    createdAt: '2024-07-22', sentDate: '2024-07-22',
  },
  {
    id: 'PO-003', poNumber: 'PO-2024-003', supplierId: 'SUP-001', supplierName: 'SupplyHouse.com',
    items: [
      { itemId: 'INV-ITM-017', itemName: 'Navien 240E Tankless Water Heater', quantity: 1, unitPrice: 1180, total: 1180 },
    ],
    itemsCount: 1, total: 1180, status: 'Draft', expectedDelivery: '2024-08-10', notes: 'Special order for upcoming install',
    createdAt: '2024-07-25',
  },
  {
    id: 'PO-004', poNumber: 'PO-2024-004', supplierId: 'SUP-005', supplierName: 'McMaster-Carr',
    items: [
      { itemId: 'INV-ITM-008', itemName: '1/2" Brass PEX Fitting - Coupling', quantity: 25, unitPrice: 2.8, total: 70 },
      { itemId: 'INV-ITM-009', itemName: '3/4" Brass PEX Fitting - 90° Elbow', quantity: 20, unitPrice: 3.8, total: 76 },
      { itemId: 'INV-ITM-011', itemName: '3/4" Ball Valve - Full Port Brass', quantity: 10, unitPrice: 17, total: 170 },
    ],
    itemsCount: 3, total: 316, status: 'Received', expectedDelivery: '2024-07-10', notes: 'Fittings restock',
    createdAt: '2024-07-05', sentDate: '2024-07-05', receivedDate: '2024-07-09',
  },
  {
    id: 'PO-005', poNumber: 'PO-2024-005', supplierId: 'SUP-004', supplierName: 'Grainger Industrial',
    items: [
      { itemId: 'INV-ITM-020', itemName: 'Milwaukee M18 ProPEX Expansion Tool', quantity: 1, unitPrice: 430, total: 430 },
      { itemId: 'INV-ITM-021', itemName: 'Ridgid K-60 Drain Cleaning Machine', quantity: 1, unitPrice: 820, total: 820 },
    ],
    itemsCount: 2, total: 1250, status: 'Cancelled', expectedDelivery: '2024-07-15', notes: 'Cancelled - found better pricing at Ferguson',
    createdAt: '2024-07-01', sentDate: '2024-07-01', cancelledDate: '2024-07-03',
  },
  {
    id: 'PO-006', poNumber: 'PO-2024-006', supplierId: 'SUP-002', supplierName: 'Ferguson Plumbing',
    items: [
      { itemId: 'INV-ITM-003', itemName: '1" PVC Schedule 40 Pipe (10ft)', quantity: 10, unitPrice: 7.5, total: 75 },
      { itemId: 'INV-ITM-004', itemName: '2" PVC Schedule 40 Pipe (10ft)', quantity: 8, unitPrice: 13, total: 104 },
      { itemId: 'INV-ITM-022', itemName: 'Oatey PVC Cement (1qt)', quantity: 5, unitPrice: 11, total: 55 },
      { itemId: 'INV-ITM-023', itemName: 'Oatey PVC Primer (1qt)', quantity: 5, unitPrice: 9, total: 45 },
    ],
    itemsCount: 4, total: 279, status: 'Draft', expectedDelivery: '2024-08-05', notes: 'Job site materials for upcoming repipe',
    createdAt: '2024-07-28',
  },
];

/* ── Activity Items ── */
export interface ActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  clientName?: string;
  amount?: number;
  userId?: string;
}

export const activities: ActivityItem[] = [
  { id: 'ACT-001', type: 'job_created', description: 'Emergency sewer line backup at Carlos Garcia', timestamp: '2024-07-12T08:30:00Z', clientName: 'Carlos Garcia', userId: 'TECH-001' },
  { id: 'ACT-002', type: 'job_completed', description: 'Main line repair completed at Johnson residence', timestamp: '2024-06-10T15:45:00Z', clientName: 'James & Sarah Johnson', amount: 520, userId: 'TECH-001' },
  { id: 'ACT-003', type: 'invoice_paid', description: 'Invoice INV-001 paid via credit card', timestamp: '2024-06-25T10:15:00Z', clientName: 'James & Sarah Johnson', amount: 520 },
  { id: 'ACT-004', type: 'client_added', description: 'New commercial client: Lone Star Brewery', timestamp: '2024-06-12T09:00:00Z', clientName: 'Lone Star Brewery' },
  { id: 'ACT-005', type: 'estimate_sent', description: 'Estimate sent to Oak Springs Apartments for Building B main shutoff', timestamp: '2024-07-15T14:00:00Z', clientName: 'Oak Springs Apartments', amount: 850 },
  { id: 'ACT-006', type: 'job_created', description: 'Whole house repipe started at Michael Brown residence', timestamp: '2024-07-08T07:00:00Z', clientName: 'Michael Brown', userId: 'TECH-001' },
  { id: 'ACT-007', type: 'job_completed', description: 'Toilet replacement completed at Patricia Martinez', timestamp: '2024-06-14T12:30:00Z', clientName: 'Patricia Martinez', amount: 395, userId: 'TECH-004' },
  { id: 'ACT-008', type: 'invoice_paid', description: 'Invoice INV-002 paid via check', timestamp: '2024-07-01T16:20:00Z', clientName: 'Robert Davis', amount: 1095 },
  { id: 'ACT-009', type: 'job_created', description: 'Emergency pipe burst at Sunset Retirement Home Building A', timestamp: '2024-07-12T06:00:00Z', clientName: 'Sunset Retirement Home', userId: 'TECH-001' },
  { id: 'ACT-010', type: 'client_added', description: 'New client: Diana Foster', timestamp: '2024-06-18T11:30:00Z', clientName: 'Diana Foster' },
  { id: 'ACT-011', type: 'estimate_sent', description: 'Restroom renovation estimate sent to Riverside Church', timestamp: '2024-06-20T13:00:00Z', clientName: 'Riverside Church', amount: 8500 },
  { id: 'ACT-012', type: 'job_completed', description: 'Commercial grease trap cleaning at Main Street Diner', timestamp: '2024-06-25T14:30:00Z', clientName: 'Main Street Diner', amount: 480, userId: 'TECH-002' },
  { id: 'ACT-013', type: 'invoice_paid', description: 'Invoice INV-006 paid via credit card', timestamp: '2024-07-08T09:45:00Z', clientName: 'Joseph White', amount: 590 },
  { id: 'ACT-014', type: 'job_created', description: 'Hot water recirculation pump replacement at Lone Star Brewery', timestamp: '2024-07-10T08:00:00Z', clientName: 'Lone Star Brewery', userId: 'TECH-003' },
  { id: 'ACT-015', type: 'estimate_sent', description: 'Quarterly backflow testing estimate sent to Sunset Retirement Home', timestamp: '2024-07-10T10:00:00Z', clientName: 'Sunset Retirement Home', amount: 1200 },
  { id: 'ACT-016', type: 'invoice_paid', description: 'Invoice INV-009 paid via check', timestamp: '2024-07-15T11:00:00Z', clientName: 'Main Street Diner', amount: 480 },
  { id: 'ACT-017', type: 'job_completed', description: 'Sink drain repair completed at Diana Foster', timestamp: '2024-07-08T16:00:00Z', clientName: 'Diana Foster', amount: 145, userId: 'TECH-004' },
  { id: 'ACT-018', type: 'client_added', description: 'New commercial client: TechHub Office Park', timestamp: '2024-06-01T09:00:00Z', clientName: 'TechHub Office Park' },
  { id: 'ACT-019', type: 'job_created', description: 'Brewery floor drain maintenance scheduled at Lone Star Brewery', timestamp: '2024-07-22T07:30:00Z', clientName: 'Lone Star Brewery', userId: 'TECH-002' },
  { id: 'ACT-020', type: 'job_completed', description: 'Outdoor spigot installed at Adams residence', timestamp: '2024-07-05T13:00:00Z', clientName: 'Steven & Karen Adams', amount: 250, userId: 'TECH-004' },
];

/* ── Helper: Get totals ── */
export function getStats() {
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.paidAmount ?? i.amount), 0);
  const outstandingRevenue = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);
  const activeJobs = jobs.filter(j => j.status === 'in-progress').length;
  const scheduledJobs = jobs.filter(j => j.status === 'scheduled').length;
  const completedJobs = jobs.filter(j => j.status === 'completed').length;
  const urgentJobs = jobs.filter(j => j.priority === 'urgent' && j.status !== 'completed').length;
  const partsLowStock = inventory.filter(i => i.quantity <= i.minQuantity).length;

  return { totalRevenue, outstandingRevenue, activeJobs, scheduledJobs, completedJobs, urgentJobs, partsLowStock, totalClients: clients.length, totalJobs: jobs.length, totalInvoices: invoices.length, totalInventoryItems: inventory.length };
}

/* ── Get transactions for a specific item (last 5) ── */
export function getItemTransactions(itemId: string): InventoryTransaction[] {
  return inventoryTransactions
    .filter(t => t.itemId === itemId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
}