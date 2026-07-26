import { Routes } from '@angular/router';

import { HomePageComponent } from './pages/home/home-page.component';
import { KotlinEditorPageComponent } from './pages/kotlin-editor/kotlin-editor-page.component';
import { ThreadPageComponent } from './pages/what-why/thread/thread-page.component';
import { WhatWhyPageComponent } from './pages/what-why/what-why-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    title: 'Home'
  },
  {
    path: 'lessons/what-why',
    component: WhatWhyPageComponent,
    title: 'What/Why?'
  },
  {
    path: 'lessons/what-why/thread',
    component: ThreadPageComponent,
    title: 'Thread'
  },
  {
    path: 'kotlin-editor',
    component: KotlinEditorPageComponent,
    title: 'Kotlin Editor'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
