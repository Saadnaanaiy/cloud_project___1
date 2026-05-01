import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'fr' | 'ar';

export const translations = {
  en: {
    // Nav / Menu
    dashboard: 'Dashboard', employees: 'Employees', attendance: 'Attendance',
    reports: 'Reports', departments: 'Departments', logout: 'Logout',
    // Topbar
    toggleTheme: 'Toggle Theme', selectLang: 'Select Language',
    // Dashboard
    totalEmployees: 'Total Employees', activeEmployees: 'Active', onLeave: 'On Leave',
    blocked: 'Blocked', addEmployee: 'Add Employee', genReport: 'Generate Report',
    attTrends: 'Attendance Trend', deptDist: 'By Department',
    empPerDept: 'Employees per Department', welcomeBoard: 'Welcome back! 👋',
    dashDesc: "Here's what's happening in your organization today.",
    allRegistered: 'All registered staff', currentlyWorking: 'Currently working',
    accessSuspended: 'Access suspended', temporarilyAbsent: 'Temporarily absent',
    exportExcel: 'Export Excel', exportPdf: 'Export PDF', generating: 'Generating...',
    noData: 'No data',
    monthlyPresence: 'Monthly Presence', monthlyAttOverview: 'Monthly Attendance Overview',
    totalPresent: 'Total Present', past6Months: 'Past 6 Months', trendingUp: 'Trending up by', thisMonth: 'this month',
    attPattern: 'Attendance Pattern', propDist: 'Proportional Distribution',
    // Attendance
    attTracker: 'Attendance Tracker', markDaily: 'Mark daily attendance for all active employees',
    saveAtt: 'Save Attendance', present: 'Present', absent: 'Absent', late: 'Late',
    resetAll: 'Reset All', brandAllPresent: 'Mark All Present', brandAllAbsent: 'Mark All Absent',
    employee: 'Employee', department: 'Department', position: 'Position', status: 'Status',
    todayAtt: "Today's Attendance",
    // Departments
    deptManagement: 'Departments Management', deptsConfigured: 'departments configured',
    addDept: 'Add Department', newDept: 'New Department', editDept: 'Edit Department',
    deptName: 'Name', deptDesc: 'Description', deptDescPlaceholder: 'Department description...',
    deleteDept: 'Delete Department', deleteDeptMsg: "This will remove the department. Employees won't be deleted.",
    noDesc: 'No description',
    // Employees
    employeeDir: 'Employees Directory', employeeFound: 'employee found', employeesFound: 'employees found',
    addEmp: 'Add Employee', editEmp: 'Edit Employee', deleteEmp: 'Delete Employee',
    viewProfile: 'Employee Profile', searchPlaceholder: 'Search by name, email, position...',
    allStatuses: 'All Statuses', allDepts: 'All Departments', active: 'Active',
    terminated: 'Terminated', hireDate: 'Hire Date', salary: 'Salary',
    firstName: 'First Name', lastName: 'Last Name', email: 'Email', phone: 'Phone',
    saveChanges: 'Save Changes', cancel: 'Cancel', delete: 'Delete', saving: 'Saving...',
    deleting: 'Deleting...', deleteEmpMsg: 'This action cannot be undone.',
    emailAddress: 'Email Address', phoneNumber: 'Phone Number',
    noEmployees: 'No employees found', adjustFilters: 'Try adjusting your filters',
    // Reports
    reportsTitle: 'Reports & Analytics', reportsDesc: 'Generate and download professional reports',
    autoReport: 'Automated Report Generation',
    autoReportDesc: 'Reports are generated in real-time from your current database. All employee data, attendance records, and statistics are included automatically.',
    empFullReport: 'Employee Full Report',
    empFullReportDesc: 'Complete employee directory with statistics, salary data, attendance analysis and department breakdown.',
    empExcel: 'Employee Excel Workbook',
    empExcelDesc: 'Multi-sheet Excel file: Employee list, Attendance records, and Statistics. Color-coded cells with styled headers.',
    includes: 'Includes', download: 'Download', pages: 'pages', worksheets: 'worksheets',
    // Login
    signIn: 'Sign In', signingIn: 'Signing in...', emailLabel: 'Email Address',
    passwordLabel: 'Password', quickAccess: 'Quick Access', loginTitle: 'Employee Manager',
    loginSubtitle: 'Sign in to your admin dashboard',
    // Common
    save: 'Save', name: 'Name', description: 'Description',
  },
  fr: {
    // Nav / Menu
    dashboard: 'Tableau de bord', employees: 'Employés', attendance: 'Présence',
    reports: 'Rapports', departments: 'Départements', logout: 'Déconnexion',
    // Topbar
    toggleTheme: 'Changer le thème', selectLang: 'Choisir la langue',
    // Dashboard
    totalEmployees: 'Total Employés', activeEmployees: 'Actifs', onLeave: 'En Congé',
    blocked: 'Bloqués', addEmployee: 'Ajouter', genReport: 'Générer un rapport',
    attTrends: 'Tendance de Présence', deptDist: 'Par Département',
    empPerDept: 'Employés par Département', welcomeBoard: 'Bon retour ! 👋',
    dashDesc: "Voici ce qui se passe aujourd'hui dans votre organisation.",
    allRegistered: 'Tout le personnel', currentlyWorking: 'En poste actuellement',
    accessSuspended: 'Accès suspendu', temporarilyAbsent: 'Absent temporairement',
    exportExcel: 'Exporter Excel', exportPdf: 'Exporter PDF', generating: 'Génération...',
    noData: 'Aucune donnée',
    monthlyPresence: 'Présence Mensuelle', monthlyAttOverview: 'Vue d\'ensemble mensuelle',
    totalPresent: 'Total Présents', past6Months: '6 derniers mois', trendingUp: 'En hausse de', thisMonth: 'ce mois-ci',
    attPattern: 'Tendance de Présence', propDist: 'Distribution Proportionnelle',
    // Attendance
    attTracker: 'Suivi de Présence', markDaily: 'Marquez la présence de tous les employés actifs',
    saveAtt: 'Enregistrer', present: 'Présent', absent: 'Absent', late: 'En retard',
    resetAll: 'Réinitialiser', brandAllPresent: 'Marquer tous présents', brandAllAbsent: 'Marquer tous absents',
    employee: 'Employé(e)', department: 'Département', position: 'Poste', status: 'Statut',
    todayAtt: "Présence d'Aujourd'hui",
    // Departments
    deptManagement: 'Gestion des Départements', deptsConfigured: 'départements configurés',
    addDept: 'Ajouter', newDept: 'Nouveau Département', editDept: 'Modifier le Département',
    deptName: 'Nom', deptDesc: 'Description', deptDescPlaceholder: 'Description du département...',
    deleteDept: 'Supprimer le Département', deleteDeptMsg: "Cela supprimera le département. Les employés ne seront pas supprimés.",
    noDesc: 'Aucune description',
    // Employees
    employeeDir: 'Annuaire des Employés', employeeFound: 'employé trouvé', employeesFound: 'employés trouvés',
    addEmp: 'Ajouter un Employé', editEmp: 'Modifier l\'Employé', deleteEmp: 'Supprimer l\'Employé',
    viewProfile: 'Profil de l\'Employé', searchPlaceholder: 'Rechercher par nom, email, poste...',
    allStatuses: 'Tous les statuts', allDepts: 'Tous les Départements', active: 'Actif',
    terminated: 'Résilié', hireDate: 'Date d\'embauche', salary: 'Salaire',
    firstName: 'Prénom', lastName: 'Nom', email: 'Email', phone: 'Téléphone',
    saveChanges: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', saving: 'Enregistrement...', deleting: 'Suppression...',
    deleteEmpMsg: 'Cette action est irréversible.',
    emailAddress: 'Adresse Email', phoneNumber: 'Numéro de Téléphone',
    noEmployees: 'Aucun employé trouvé', adjustFilters: 'Essayez d\'ajuster vos filtres',
    // Reports
    reportsTitle: 'Rapports & Analyses', reportsDesc: 'Générez et téléchargez des rapports professionnels',
    autoReport: 'Génération Automatique de Rapports',
    autoReportDesc: 'Les rapports sont générés en temps réel depuis votre base de données. Toutes les données employés, présences et statistiques sont incluses automatiquement.',
    empFullReport: 'Rapport Complet Employés',
    empFullReportDesc: 'Répertoire employés complet avec statistiques, salaires, analyse de présence et répartition par département.',
    empExcel: 'Classeur Excel Employés',
    empExcelDesc: 'Fichier Excel multi-feuilles : Liste employés, Présences et Statistiques. Cellules colorées avec en-têtes stylisés.',
    includes: 'Contient', download: 'Télécharger', pages: 'pages', worksheets: 'feuilles',
    // Login
    signIn: 'Se connecter', signingIn: 'Connexion...', emailLabel: 'Adresse Email',
    passwordLabel: 'Mot de passe', quickAccess: 'Accès Rapide', loginTitle: 'Gestionnaire RH',
    loginSubtitle: 'Connectez-vous à votre tableau de bord',
    // Common
    save: 'Enregistrer', name: 'Nom', description: 'Description',
  },
  ar: {
    // Nav / Menu
    dashboard: 'لوحة القيادة', employees: 'الموظفين', attendance: 'الحضور',
    reports: 'التقارير', departments: 'الأقسام', logout: 'تسجيل خروج',
    // Topbar
    toggleTheme: 'تغيير المظهر', selectLang: 'اختر اللغة',
    // Dashboard
    totalEmployees: 'إجمالي الموظفين', activeEmployees: 'نشطون', onLeave: 'في إجازة',
    blocked: 'محظورون', addEmployee: 'إضافة موظف', genReport: 'إنشاء تقرير',
    attTrends: 'اتجاه الحضور', deptDist: 'حسب القسم',
    empPerDept: 'الموظفون لكل قسم', welcomeBoard: 'مرحباً بعودتك! 👋',
    dashDesc: 'إليك ما يحدث في مؤسستك اليوم.',
    allRegistered: 'جميع الموظفين المسجلين', currentlyWorking: 'يعملون حاليًا',
    accessSuspended: 'الوصول معلق', temporarilyAbsent: 'غائب مؤقتًا',
    exportExcel: 'تصدير إكسل', exportPdf: 'تصدير PDF', generating: 'جارٍ الإنشاء...',
    noData: 'لا توجد بيانات',
    monthlyPresence: 'الحضور الشهري', monthlyAttOverview: 'نظرة عامة على الحضور',
    totalPresent: 'إجمالي الحاضرين', past6Months: 'آخر 6 أشهر', trendingUp: 'في ارتفاع بنسبة', thisMonth: 'هذا الشهر',
    attPattern: 'نمط الحضور', propDist: 'التوزيع النسبي',
    // Attendance
    attTracker: 'تتبع الحضور', markDaily: 'سجّل الحضور اليومي لجميع الموظفين النشطين',
    saveAtt: 'حفظ الحضور', present: 'حاضر', absent: 'غائب', late: 'متأخر',
    resetAll: 'إعادة تعيين', brandAllPresent: 'تحديد الكل حاضر', brandAllAbsent: 'تحديد الكل غائب',
    employee: 'الموظف', department: 'القسم', position: 'المنصب', status: 'الحالة',
    todayAtt: 'حضور اليوم',
    // Departments
    deptManagement: 'إدارة الأقسام', deptsConfigured: 'أقسام مُهيأة',
    addDept: 'إضافة قسم', newDept: 'قسم جديد', editDept: 'تعديل القسم',
    deptName: 'الاسم', deptDesc: 'الوصف', deptDescPlaceholder: 'وصف القسم...',
    deleteDept: 'حذف القسم', deleteDeptMsg: 'سيؤدي هذا إلى إزالة القسم. لن يتم حذف الموظفين.',
    noDesc: 'لا يوجد وصف',
    // Employees
    employeeDir: 'دليل الموظفين', employeeFound: 'موظف وُجد', employeesFound: 'موظفون وُجدوا',
    addEmp: 'إضافة موظف', editEmp: 'تعديل الموظف', deleteEmp: 'حذف الموظف',
    viewProfile: 'ملف الموظف', searchPlaceholder: 'ابحث بالاسم أو البريد أو المنصب...',
    allStatuses: 'كل الحالات', allDepts: 'كل الأقسام', active: 'نشط',
    terminated: 'منتهي', hireDate: 'تاريخ التوظيف', salary: 'الراتب',
    firstName: 'الاسم الأول', lastName: 'اسم العائلة', email: 'البريد الإلكتروني', phone: 'الهاتف',
    saveChanges: 'حفظ التغييرات', cancel: 'إلغاء', delete: 'حذف', saving: 'جارٍ الحفظ...', deleting: 'جارٍ الحذف...',
    deleteEmpMsg: 'لا يمكن التراجع عن هذا الإجراء.',
    emailAddress: 'البريد الإلكتروني', phoneNumber: 'رقم الهاتف',
    noEmployees: 'لا يوجد موظفون', adjustFilters: 'جرّب تعديل الفلاتر',
    // Reports
    reportsTitle: 'التقارير والتحليلات', reportsDesc: 'إنشاء وتنزيل تقارير احترافية',
    autoReport: 'إنشاء التقارير تلقائيًا',
    autoReportDesc: 'يتم إنشاء التقارير في الوقت الفعلي من قاعدة بياناتك. تشمل جميع بيانات الموظفين والحضور والإحصاءات تلقائيًا.',
    empFullReport: 'التقرير الكامل للموظفين',
    empFullReportDesc: 'دليل موظفين شامل مع إحصاءات وبيانات الرواتب وتحليل الحضور وتوزيع الأقسام.',
    empExcel: 'مصنف Excel للموظفين',
    empExcelDesc: 'ملف Excel متعدد الأوراق: قائمة الموظفين، سجلات الحضور، والإحصاءات. خلايا ملونة بعناوين منسقة.',
    includes: 'يتضمن', download: 'تحميل', pages: 'صفحات', worksheets: 'أوراق',
    // Login
    signIn: 'تسجيل الدخول', signingIn: 'جارٍ الدخول...', emailLabel: 'البريد الإلكتروني',
    passwordLabel: 'كلمة المرور', quickAccess: 'وصول سريع', loginTitle: 'نظام إدارة الموظفين',
    loginSubtitle: 'سجّل الدخول إلى لوحة التحكم',
    // Common
    save: 'حفظ', name: 'الاسم', description: 'الوصف',
  }
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Language;
    if (saved && ['en', 'fr', 'ar'].includes(saved)) setLang(saved);
  }, []);

  const changeLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t = (key: keyof typeof translations['en']): string =>
    translations[lang][key] || translations['en'][key] || key;

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t, dir }}>
      <div dir={dir} style={{ width: '100vw', minHeight: '100vh' }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
