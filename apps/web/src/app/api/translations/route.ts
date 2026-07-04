import { NextRequest } from 'next/server';

const translations = {
  en: {
    app: { name: "PlumbCore AI", tagline: "Plumbing operations platform" },
    nav: {
      main: "Main", aiTools: "AI Tools", finance: "Finance", admin: "Admin",
      dashboard: "Dashboard", jobs: "Jobs & Schedule", clients: "Clients",
      schedule: "Schedule", routeMap: "Route Map", leads: "Leads",
      aiChat: "AI Chat", voiceNotes: "Voice Notes → Invoice",
      emergency: "Emergency Triage", receptionist: "Voice Receptionist",
      phoneCalls: "Phone Calls", sms: "SMS Messaging",
      pricebook: "Pricebook", priceIncreases: "Price Increases",
      invoicing: "Invoicing", inventory: "Inventory",
      suppliers: "Suppliers", purchaseOrders: "Purchase Orders",
      insights: "Inventory Insights", reports: "Reports",
      team: "Team", notifications: "Notifications",
      auditLog: "Audit Log", settings: "Settings"
    },
    dashboard: {
      title: "Dashboard", subtitle: "Dispatcher control room — live overview",
      revenue: "Revenue", outstanding: "Outstanding", activeJobs: "Active Jobs",
      scheduled: "Scheduled", completed: "Completed", urgent: "Urgent",
      lowStock: "Low Stock Items", clients: "Clients", jobs: "Jobs",
      invoices: "Invoices", recentActivity: "Recent Activity",
      quickActions: "Quick Actions", newJob: "+ New Job", newClient: "+ New Client",
      createInvoice: "Create Invoice"
    },
    common: {
      search: "Search...", loading: "Loading...", error: "Error",
      save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit",
      create: "Create", back: "Back", next: "Next", done: "Done",
      noData: "No data available", yes: "Yes", no: "No",
      confirm: "Confirm", close: "Close", status: "Status", actions: "Actions",
      email: "Email", phone: "Phone", address: "Address"
    },
    status: {
      active: "Active", inactive: "Inactive",
      draft: "Draft", sent: "Sent", paid: "Paid", overdue: "Overdue", cancelled: "Cancelled",
      scheduled: "Scheduled", inProgress: "In Progress", completed: "Completed", urgent: "Urgent",
      online: "Online", busy: "Busy", away: "Away", offline: "Offline",
      low: "Low", medium: "Medium", high: "High", critical: "Critical",
      emergency: "Emergency", today: "Today", thisWeek: "This Week", flexible: "Flexible"
    },
    inventory: {
      title: "Inventory", subtitle: "Manage parts, tools, and supplies",
      lowStockAlert: "items below minimum stock",
      addItem: "Add Item", editItem: "Edit Item", deleteItem: "Delete Item",
      name: "Name", sku: "SKU", category: "Category",
      quantity: "Quantity", minStock: "Min Stock", unitPrice: "Unit Price",
      supplier: "Supplier", location: "Location", noItems: "No inventory items found"
    },
    invoicing: {
      title: "Invoicing", subtitle: "Manage invoices and payments",
      addInvoice: "Add Invoice", invoiceNumber: "Invoice #",
      client: "Client", amount: "Amount", dueDate: "Due Date",
      issueDate: "Issue Date", paidDate: "Paid Date",
      paid: "Paid", outstanding: "Outstanding", overdue: "Overdue",
      noInvoices: "No invoices found"
    },
    clients: {
      title: "Clients", subtitle: "Manage your client base",
      addClient: "Add Client", name: "Name", totalJobs: "Total Jobs",
      revenue: "Revenue", since: "Client since", noClients: "No clients found"
    },
    jobs: {
      title: "Jobs & Schedule", subtitle: "Manage work orders and dispatch",
      addJob: "Add Job", jobTitle: "Title", description: "Description",
      priority: "Priority", assignedTo: "Assigned To",
      estimatedCost: "Est. Cost", actualCost: "Actual Cost",
      noJobs: "No jobs found"
    },
    team: {
      title: "Team", subtitle: "Manage your team members",
      addMember: "Add Member", name: "Name", role: "Role",
      status: "Status", specialties: "Specialties", completedToday: "Today",
      rating: "Rating", noMembers: "No team members found"
    },
    reports: {
      title: "Reports", subtitle: "Business performance analytics",
      revenue: "Revenue", expenses: "Expenses", profit: "Profit",
      topTechs: "Top Technicians", mostCommon: "Most Common Job Type",
      fastestCompleted: "Fastest Completed", jobCompletion: "Job Completion Metrics"
    },
    settings: {
      title: "Settings", subtitle: "Configure your account",
      profile: "Profile", company: "Company", billing: "Billing",
      notifications: "Notifications", language: "Language",
      theme: "Theme", light: "Light", dark: "Dark",
      saveChanges: "Save Changes"
    },
    lead: {
      title: "Leads", subtitle: "Incoming customer requests",
      convertToJob: "Convert to Job", delete: "Delete Lead",
      noLeads: "No leads yet"
    },
    quote: {
      title: "Get a Free Plumbing Estimate",
      subtitle: "Upload a photo and we'll analyze it instantly",
      upload: "Drop a photo of your leak here",
      uploadHint: "or click to browse (max 3 photos)",
      name: "Name", phone: "Phone *", email: "Email",
      address: "Address *", urgency: "How urgent?",
      getEstimate: "Get My Estimate",
      analyzing: "Analyzing your photos...",
      analyzingHint: "This takes a few seconds",
      continueBtn: "Continue →"
    }
  },
  fr: {
    app: { name: "PlumbCore IA", tagline: "Plateforme de gestion de plomberie" },
    nav: {
      main: "Principal", aiTools: "Outils IA", finance: "Finances", admin: "Admin",
      dashboard: "Tableau de bord", jobs: "Travaux & Planning",
      clients: "Clients", schedule: "Planning", routeMap: "Itinéraire",
      leads: "Prospects", aiChat: "Chat IA",
      voiceNotes: "Notes vocales → Facture", emergency: "Urgence",
      receptionist: "Standard vocal", phoneCalls: "Appels",
      sms: "SMS", pricebook: "Tarifs",
      priceIncreases: "Augmentations", invoicing: "Facturation",
      inventory: "Stock", suppliers: "Fournisseurs",
      purchaseOrders: "Bons de commande", insights: "Analyse du stock",
      reports: "Rapports", team: "Équipe",
      notifications: "Notifications", auditLog: "Journal",
      settings: "Paramètres"
    },
    dashboard: {
      title: "Tableau de bord", subtitle: "Poste de contrôle en temps réel",
      revenue: "Revenus", outstanding: "Impayés",
      activeJobs: "Travaux en cours", scheduled: "Planifiés",
      completed: "Terminés", urgent: "Urgents",
      lowStock: "Stock bas", clients: "Clients",
      jobs: "Travaux", invoices: "Factures",
      recentActivity: "Activité récente",
      quickActions: "Actions rapides", newJob: "+ Nouveau travail",
      newClient: "+ Nouveau client", createInvoice: "Créer une facture"
    },
    common: {
      search: "Rechercher...", loading: "Chargement...", error: "Erreur",
      save: "Enregistrer", cancel: "Annuler", delete: "Supprimer",
      edit: "Modifier", create: "Créer", back: "Retour",
      next: "Suivant", done: "Terminé", noData: "Aucune donnée",
      yes: "Oui", no: "Non", confirm: "Confirmer",
      close: "Fermer", status: "Statut", actions: "Actions",
      email: "E-mail", phone: "Téléphone", address: "Adresse"
    },
    status: {
      active: "Actif", inactive: "Inactif",
      draft: "Brouillon", sent: "Envoyé", paid: "Payé",
      overdue: "En retard", cancelled: "Annulé",
      scheduled: "Planifié", inProgress: "En cours",
      completed: "Terminé", urgent: "Urgent",
      online: "En ligne", busy: "Occupé", away: "Absent",
      offline: "Hors ligne", low: "Faible", medium: "Moyen",
      high: "Élevé", critical: "Critique",
      emergency: "Urgence", today: "Aujourd'hui",
      thisWeek: "Cette semaine", flexible: "Flexible"
    },
    inventory: {
      title: "Stock", subtitle: "Gérer pièces, outils et fournitures",
      lowStockAlert: "articles sous le stock minimum",
      addItem: "Ajouter", editItem: "Modifier", deleteItem: "Supprimer",
      name: "Nom", sku: "SKU", category: "Catégorie",
      quantity: "Quantité", minStock: "Stock min", unitPrice: "Prix unitaire",
      supplier: "Fournisseur", location: "Emplacement",
      noItems: "Aucun article trouvé"
    },
    invoicing: {
      title: "Facturation", subtitle: "Gérer factures et paiements",
      addInvoice: "Ajouter une facture", invoiceNumber: "Facture #",
      client: "Client", amount: "Montant", dueDate: "Échéance",
      issueDate: "Date d'émission", paidDate: "Date de paiement",
      paid: "Payé", outstanding: "Impayé", overdue: "En retard",
      noInvoices: "Aucune facture trouvée"
    },
    clients: {
      title: "Clients", subtitle: "Gérer votre base clients",
      addClient: "Ajouter un client", name: "Nom",
      totalJobs: "Total travaux", revenue: "Revenus",
      since: "Client depuis", noClients: "Aucun client trouvé"
    },
    jobs: {
      title: "Travaux & Planning", subtitle: "Gérer les ordres de travail",
      addJob: "Ajouter un travail", jobTitle: "Titre",
      description: "Description", priority: "Priorité",
      assignedTo: "Assigné à", estimatedCost: "Coût estimé",
      actualCost: "Coût réel", noJobs: "Aucun travail trouvé"
    },
    team: {
      title: "Équipe", subtitle: "Gérer votre équipe",
      addMember: "Ajouter un membre", name: "Nom",
      role: "Rôle", status: "Statut", specialties: "Spécialités",
      completedToday: "Aujourd'hui", rating: "Note",
      noMembers: "Aucun membre trouvé"
    },
    reports: {
      title: "Rapports", subtitle: "Analyse de performance",
      revenue: "Revenus", expenses: "Dépenses", profit: "Bénéfice",
      topTechs: "Meilleurs techniciens",
      mostCommon: "Type de travail le plus courant",
      fastestCompleted: "Terminé le plus rapide",
      jobCompletion: "Métriques d'achèvement"
    },
    settings: {
      title: "Paramètres", subtitle: "Configurer votre compte",
      profile: "Profil", company: "Entreprise", billing: "Facturation",
      notifications: "Notifications", language: "Langue",
      theme: "Thème", light: "Clair", dark: "Sombre",
      saveChanges: "Enregistrer"
    },
    lead: {
      title: "Prospects", subtitle: "Demandes clients entrantes",
      convertToJob: "Convertir en travail", delete: "Supprimer",
      noLeads: "Aucun prospect pour l'instant"
    },
    quote: {
      title: "Obtenez un devis gratuit",
      subtitle: "Téléchargez une photo pour une analyse instantanée",
      upload: "Déposez une photo de votre fuite ici",
      uploadHint: "ou cliquez pour parcourir (max 3 photos)",
      name: "Nom", phone: "Téléphone *", email: "E-mail",
      address: "Adresse *", urgency: "Urgence ?",
      getEstimate: "Obtenir mon devis",
      analyzing: "Analyse de vos photos...",
      analyzingHint: "Cela prend quelques secondes",
      continueBtn: "Continuer →"
    }
  },
  es: {
    app: { name: "PlumbCore IA", tagline: "Plataforma de gestión de fontanería" },
    nav: {
      main: "Principal", aiTools: "Herramientas IA", finance: "Finanzas", admin: "Admin",
      dashboard: "Panel", jobs: "Trabajos & Horario",
      clients: "Clientes", schedule: "Horario", routeMap: "Ruta",
      leads: "Prospectos", aiChat: "Chat IA",
      voiceNotes: "Notas de voz → Factura",
      emergency: "Emergencia", receptionist: "Recepcionista",
      phoneCalls: "Llamadas", sms: "SMS", pricebook: "Tarifas",
      priceIncreases: "Aumentos", invoicing: "Facturación",
      inventory: "Inventario", suppliers: "Proveedores",
      purchaseOrders: "Órdenes de compra", insights: "Análisis",
      reports: "Informes", team: "Equipo",
      notifications: "Notificaciones", auditLog: "Auditoría",
      settings: "Ajustes"
    },
    dashboard: {
      title: "Panel de control", subtitle: "Sala de control en tiempo real",
      revenue: "Ingresos", outstanding: "Pendiente",
      activeJobs: "Trabajos activos", scheduled: "Programados",
      completed: "Completados", urgent: "Urgentes",
      lowStock: "Stock bajo", clients: "Clientes",
      jobs: "Trabajos", invoices: "Facturas",
      recentActivity: "Actividad reciente",
      quickActions: "Acciones rápidas", newJob: "+ Nuevo trabajo",
      newClient: "+ Nuevo cliente", createInvoice: "Crear factura"
    },
    common: {
      search: "Buscar...", loading: "Cargando...", error: "Error",
      save: "Guardar", cancel: "Cancelar", delete: "Eliminar",
      edit: "Editar", create: "Crear", back: "Atrás",
      next: "Siguiente", done: "Hecho", noData: "Sin datos",
      yes: "Sí", no: "No", confirm: "Confirmar",
      close: "Cerrar", status: "Estado", actions: "Acciones",
      email: "Correo", phone: "Teléfono", address: "Dirección"
    },
    status: {
      active: "Activo", inactive: "Inactivo",
      draft: "Borrador", sent: "Enviado", paid: "Pagado",
      overdue: "Vencido", cancelled: "Cancelado",
      scheduled: "Programado", inProgress: "En progreso",
      completed: "Completado", urgent: "Urgente",
      online: "En línea", busy: "Ocupado", away: "Ausente",
      offline: "Desconectado", low: "Bajo", medium: "Medio",
      high: "Alto", critical: "Crítico",
      emergency: "Emergencia", today: "Hoy",
      thisWeek: "Esta semana", flexible: "Flexible"
    },
    inventory: {
      title: "Inventario", subtitle: "Gestionar piezas, herramientas y suministros",
      lowStockAlert: "artículos por debajo del mínimo",
      addItem: "Agregar", editItem: "Editar", deleteItem: "Eliminar",
      name: "Nombre", sku: "SKU", category: "Categoría",
      quantity: "Cantidad", minStock: "Stock mín", unitPrice: "Precio",
      supplier: "Proveedor", location: "Ubicación",
      noItems: "Sin artículos encontrados"
    },
    invoicing: {
      title: "Facturación", subtitle: "Gestionar facturas y pagos",
      addInvoice: "Agregar factura", invoiceNumber: "Factura #",
      client: "Cliente", amount: "Monto", dueDate: "Vencimiento",
      issueDate: "Emisión", paidDate: "Pago",
      paid: "Pagado", outstanding: "Pendiente", overdue: "Vencido",
      noInvoices: "Sin facturas encontradas"
    },
    clients: {
      title: "Clientes", subtitle: "Gestionar base de clientes",
      addClient: "Agregar cliente", name: "Nombre",
      totalJobs: "Total trabajos", revenue: "Ingresos",
      since: "Cliente desde", noClients: "Sin clientes encontrados"
    },
    jobs: {
      title: "Trabajos & Horario", subtitle: "Gestionar órdenes de trabajo",
      addJob: "Agregar trabajo", jobTitle: "Título",
      description: "Descripción", priority: "Prioridad",
      assignedTo: "Asignado a", estimatedCost: "Costo est.",
      actualCost: "Costo real", noJobs: "Sin trabajos encontrados"
    },
    team: {
      title: "Equipo", subtitle: "Gestionar su equipo",
      addMember: "Agregar miembro", name: "Nombre",
      role: "Rol", status: "Estado", specialties: "Especialidades",
      completedToday: "Hoy", rating: "Puntuación",
      noMembers: "Sin miembros encontrados"
    },
    reports: {
      title: "Informes", subtitle: "Análisis de rendimiento",
      revenue: "Ingresos", expenses: "Gastos", profit: "Ganancia",
      topTechs: "Mejores técnicos",
      mostCommon: "Tipo de trabajo más común",
      fastestCompleted: "Más rápido completado",
      jobCompletion: "Métricas de finalización"
    },
    settings: {
      title: "Ajustes", subtitle: "Configurar su cuenta",
      profile: "Perfil", company: "Empresa", billing: "Facturación",
      notifications: "Notificaciones", language: "Idioma",
      theme: "Tema", light: "Claro", dark: "Oscuro",
      saveChanges: "Guardar cambios"
    },
    lead: {
      title: "Prospectos", subtitle: "Solicitudes entrantes",
      convertToJob: "Convertir a trabajo", delete: "Eliminar",
      noLeads: "Sin prospectos aún"
    },
    quote: {
      title: "Obtenga un presupuesto gratuito",
      subtitle: "Suba una foto para análisis instantáneo",
      upload: "Suelte una foto de su fuga aquí",
      uploadHint: "o haga clic para explorar (máx. 3 fotos)",
      name: "Nombre", phone: "Teléfono *", email: "Correo",
      address: "Dirección *", urgency: "¿Urgencia?",
      getEstimate: "Obtener presupuesto",
      analyzing: "Analizando sus fotos...",
      analyzingHint: "Esto toma unos segundos",
      continueBtn: "Continuar →"
    }
  },
  de: {
    app: { name: "PlumbCore KI", tagline: "Sanitär-Management-Plattform" },
    nav: {
      main: "Haupt", aiTools: "KI-Tools", finance: "Finanzen", admin: "Admin",
      dashboard: "Dashboard", jobs: "Aufträge & Planung",
      clients: "Kunden", schedule: "Planung", routeMap: "Route",
      leads: "Interessenten", aiChat: "KI-Chat",
      voiceNotes: "Sprachmemos → Rechnung",
      emergency: "Notfall", receptionist: "Telefonzentrale",
      phoneCalls: "Anrufe", sms: "SMS", pricebook: "Preisliste",
      priceIncreases: "Preiserhöhungen", invoicing: "Rechnungen",
      inventory: "Lager", suppliers: "Lieferanten",
      purchaseOrders: "Bestellungen", insights: "Lageranalyse",
      reports: "Berichte", team: "Team",
      notifications: "Benachrichtigungen", auditLog: "Protokoll",
      settings: "Einstellungen"
    },
    dashboard: {
      title: "Dashboard", subtitle: "Echtzeit-Übersicht",
      revenue: "Umsatz", outstanding: "Ausstehend",
      activeJobs: "Aktive Aufträge", scheduled: "Geplant",
      completed: "Abgeschlossen", urgent: "Dringend",
      lowStock: "Niedriger Lagerbestand", clients: "Kunden",
      jobs: "Aufträge", invoices: "Rechnungen",
      recentActivity: "Letzte Aktivität",
      quickActions: "Schnellaktionen", newJob: "+ Neuer Auftrag",
      newClient: "+ Neuer Kunde", createInvoice: "Rechnung erstellen"
    },
    common: {
      search: "Suchen...", loading: "Laden...", error: "Fehler",
      save: "Speichern", cancel: "Abbrechen", delete: "Löschen",
      edit: "Bearbeiten", create: "Erstellen", back: "Zurück",
      next: "Weiter", done: "Fertig", noData: "Keine Daten",
      yes: "Ja", no: "Nein", confirm: "Bestätigen",
      close: "Schließen", status: "Status", actions: "Aktionen",
      email: "E-Mail", phone: "Telefon", address: "Adresse"
    },
    status: {
      active: "Aktiv", inactive: "Inaktiv",
      draft: "Entwurf", sent: "Gesendet", paid: "Bezahlt",
      overdue: "Überfällig", cancelled: "Storniert",
      scheduled: "Geplant", inProgress: "In Bearbeitung",
      completed: "Abgeschlossen", urgent: "Dringend",
      online: "Online", busy: "Beschäftigt", away: "Abwesend",
      offline: "Offline", low: "Niedrig", medium: "Mittel",
      high: "Hoch", critical: "Kritisch",
      emergency: "Notfall", today: "Heute",
      thisWeek: "Diese Woche", flexible: "Flexibel"
    },
    inventory: {
      title: "Lager", subtitle: "Teile, Werkzeuge und Zubehör verwalten",
      lowStockAlert: "Artikel unter Mindestbestand",
      addItem: "Hinzufügen", editItem: "Bearbeiten",
      deleteItem: "Löschen", name: "Name", sku: "SKU",
      category: "Kategorie", quantity: "Menge",
      minStock: "Mindestbestand", unitPrice: "Einheitspreis",
      supplier: "Lieferant", location: "Standort",
      noItems: "Keine Artikel gefunden"
    },
    invoicing: {
      title: "Rechnungen", subtitle: "Rechnungen und Zahlungen verwalten",
      addInvoice: "Rechnung hinzufügen", invoiceNumber: "Rechnung #",
      client: "Kunde", amount: "Betrag", dueDate: "Fällig am",
      issueDate: "Ausgestellt am", paidDate: "Bezahlt am",
      paid: "Bezahlt", outstanding: "Ausstehend", overdue: "Überfällig",
      noInvoices: "Keine Rechnungen gefunden"
    },
    clients: {
      title: "Kunden", subtitle: "Kundenstamm verwalten",
      addClient: "Kunde hinzufügen", name: "Name",
      totalJobs: "Aufträge gesamt", revenue: "Umsatz",
      since: "Kunde seit", noClients: "Keine Kunden gefunden"
    },
    jobs: {
      title: "Aufträge & Planung", subtitle: "Arbeitsaufträge verwalten",
      addJob: "Auftrag hinzufügen", jobTitle: "Titel",
      description: "Beschreibung", priority: "Priorität",
      assignedTo: "Zugewiesen an", estimatedCost: "Kostenvoranschlag",
      actualCost: "Tatsächliche Kosten", noJobs: "Keine Aufträge gefunden"
    },
    team: {
      title: "Team", subtitle: "Mitarbeiter verwalten",
      addMember: "Mitarbeiter hinzufügen", name: "Name",
      role: "Rolle", status: "Status", specialties: "Spezialgebiete",
      completedToday: "Heute", rating: "Bewertung",
      noMembers: "Keine Mitarbeiter gefunden"
    },
    reports: {
      title: "Berichte", subtitle: "Geschäftsanalyse",
      revenue: "Umsatz", expenses: "Ausgaben", profit: "Gewinn",
      topTechs: "Beste Techniker",
      mostCommon: "Häufigster Auftragstyp",
      fastestCompleted: "Schnellster Abschluss",
      jobCompletion: "Abschlusskennzahlen"
    },
    settings: {
      title: "Einstellungen", subtitle: "Konto konfigurieren",
      profile: "Profil", company: "Unternehmen", billing: "Abrechnung",
      notifications: "Benachrichtigungen", language: "Sprache",
      theme: "Design", light: "Hell", dark: "Dunkel",
      saveChanges: "Änderungen speichern"
    },
    lead: {
      title: "Interessenten", subtitle: "Eingehende Kundenanfragen",
      convertToJob: "In Auftrag umwandeln", delete: "Löschen",
      noLeads: "Noch keine Interessenten"
    },
    quote: {
      title: "Kostenlosen Kostenvoranschlag erhalten",
      subtitle: "Foto hochladen für sofortige Analyse",
      upload: "Foto Ihres Lecks hier ablegen",
      uploadHint: "oder klicken zum Durchsuchen (max. 3 Fotos)",
      name: "Name", phone: "Telefon *", email: "E-Mail",
      address: "Adresse *", urgency: "Dringlichkeit?",
      getEstimate: "Kostenvoranschlag erhalten",
      analyzing: "Fotos werden analysiert...",
      analyzingHint: "Dies dauert einige Sekunden",
      continueBtn: "Weiter →"
    }
  }
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'en';
  
  if (!['en', 'fr', 'es', 'de'].includes(locale)) {
    return new Response('Invalid locale', { status: 400 });
  }

  return Response.json(translations[locale as keyof typeof translations] || {});
}