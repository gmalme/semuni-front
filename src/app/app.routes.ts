// app.routes.ts
import { Routes } from '@angular/router';
import { OficinasListComponent } from './pages/oficinas/oficinas-list.component';
import { OficinaFormComponent } from './pages/oficinas/oficina-form.component';
import { CarrosListComponent } from './pages/carros/carros-list.component';
import { CarroFormComponent } from './pages/carros/carro-form.component';

export const routes: Routes = [
    { path: '', redirectTo: 'oficinas', pathMatch: 'full' },

    { path: 'oficinas', component: OficinasListComponent },
    { path: 'oficinas/new', component: OficinaFormComponent },
    { path: 'oficinas/:id', component: OficinaFormComponent },

    { path: 'carros', component: CarrosListComponent },
    { path: 'carros/new', component: CarroFormComponent },
    { path: 'carros/:id', component: CarroFormComponent },

    // <<< nova rota
    {
        path: 'carros/:id/diagnostico',
        loadComponent: () =>
            import('./pages/carros-diagnostico/carro-diagnostico')
                .then(m => m.CarroDiagnosticoComponent)
    }
];
