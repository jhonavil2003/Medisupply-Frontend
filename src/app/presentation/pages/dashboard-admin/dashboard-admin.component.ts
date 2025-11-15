import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [RouterModule, MatButtonModule, TranslateModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class DashboardAdminComponent implements OnInit {
  private translate = inject(TranslateService);
  
  showLangMenu = signal(false);
  sidebarVisible = true;
  selectedLanguage = signal('es');
  
  languages = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' }
  ];

  ngOnInit() {
    const savedLang = localStorage.getItem('language') || 'es';
    this.changeLanguage(savedLang);
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  changeLanguage(lang: string) {
    this.selectedLanguage.set(lang);
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }

  onLanguageChange(lang: string) {
    this.changeLanguage(lang);
    this.showLangMenu.set(false);
  }
}
