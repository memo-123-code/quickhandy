import { PendingProvider, DisputeTicket, PlatformUser, NotificationItem } from "@/types/admin";

export const initialNotifications: NotificationItem[] = [
  { id: "1", title: "New KYC Document submitted by Derrick Vance", time: "10 mins ago", unread: true, type: "KYC" },
  { id: "2", title: "High priority dispute ticket #DIS-202 opened", time: "1 hour ago", unread: true, type: "DISPUTE" },
  { id: "3", title: "Monthly Financial Report ready for download", time: "3 hours ago", unread: false, type: "SYSTEM" },
];

export const initialProviders: PendingProvider[] = [
  { id: "P-101", name: "Derrick Vance", category: "Plumbing", license: "LIC-88219-NY", documentName: "derrick_license_id.pdf", status: "PENDING", appliedDate: "2026-06-27" },
  { id: "P-102", name: "Samantha Cross", category: "Electrical", license: "LIC-44021-NJ", documentName: "samantha_cert_id.pdf", status: "PENDING", appliedDate: "2026-06-28" },
  { id: "P-103", name: "Arthur Dent", category: "Carpentry", license: "LIC-09123-NY", documentName: "arthur_background_check.pdf", status: "APPROVED", appliedDate: "2026-06-25" },
  { id: "P-104", name: "Walter White", category: "HVAC", license: "LIC-66381-NM", documentName: "walter_hvac_license.pdf", status: "PENDING", appliedDate: "2026-06-26" },
  { id: "P-105", name: "Elena Rostova", category: "Painting", license: "LIC-11920-FL", documentName: "elena_painting_cert.pdf", status: "INFO_REQUESTED", appliedDate: "2026-06-24" },
  { id: "P-106", name: "Marcus Brody", category: "Plumbing", license: "LIC-90231-TX", documentName: "marcus_master_plumber.pdf", status: "REJECTED", appliedDate: "2026-06-20" },
  { id: "P-107", name: "Claire Bennet", category: "Electrical", license: "LIC-33109-CA", documentName: "claire_license_verif.pdf", status: "PENDING", appliedDate: "2026-06-29" },
  { id: "P-108", name: "Gordon Freeman", category: "Appliance Repair", license: "LIC-77123-WA", documentName: "gordon_tech_cert.pdf", status: "APPROVED", appliedDate: "2026-06-22" },
];

export const initialDisputes: DisputeTicket[] = [
  { id: "DIS-202", taskId: "T-7155", clientName: "Bruce Wayne", providerName: "Alfred Pennyworth", title: "Damage Claim", description: "Provider accidentally damaged drywall while drilling for electrical socket installation.", status: "OPEN", createdAt: "2026-06-28", relativeTime: "2 hours ago", priority: "HIGH" },
  { id: "DIS-201", taskId: "T-8092", clientName: "Sarah Connor", providerName: "John Connor", title: "Incorrect Payout", description: "Client claims plumber charged 2 hours instead of the 1 hour actual work time.", status: "OPEN", createdAt: "2026-06-27", relativeTime: "5 hours ago", priority: "MEDIUM" },
  { id: "DIS-199", taskId: "T-6012", clientName: "Tony Stark", providerName: "Steve Rogers", title: "No Show", description: "Provider did not show up at the scheduled time. Provider claims the address was wrong.", status: "RESOLVED", createdAt: "2026-06-25", relativeTime: "2 days ago", priority: "LOW" },
  { id: "DIS-205", taskId: "T-8811", clientName: "Natasha Romanoff", providerName: "Clint Barton", title: "Unprofessional Behavior", description: "Provider was rude and refused to wear shoe covers inside.", status: "OPEN", createdAt: "2026-06-29", relativeTime: "30 mins ago", priority: "HIGH" },
  { id: "DIS-198", taskId: "T-5510", clientName: "Peter Parker", providerName: "Otto Octavius", title: "Incomplete Work", description: "HVAC was supposed to be fixed but stopped working after 2 hours.", status: "OPEN", createdAt: "2026-06-24", relativeTime: "3 days ago", priority: "MEDIUM" },
];

export const initialPlatformUsers: PlatformUser[] = [
  { id: "U-819", name: "Alice Wonderland", email: "alice@example.com", role: "CLIENT", status: "ACTIVE", joinedDate: "2026-01-15", completedJobs: 12 },
  { id: "U-820", name: "Bob Builder", email: "bob@builder.com", role: "PROVIDER", status: "ACTIVE", joinedDate: "2025-11-02", rating: 4.8, completedJobs: 156 },
  { id: "U-821", name: "Charlie Chaplin", email: "charlie@chaplin.com", role: "CLIENT", status: "SUSPENDED", joinedDate: "2026-03-22", completedJobs: 3 },
  { id: "U-822", name: "Diana Prince", email: "diana@themyscira.com", role: "PROVIDER", status: "VERIFYING", joinedDate: "2026-06-28", rating: 0, completedJobs: 0 },
];
