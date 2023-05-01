import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AiComponent } from './components/ai/ai.component';
import { TwoPlayersComponent } from './components/two-players/two-players.component';
import { AboutComponent } from './components/about/about.component';

const routes: Routes = [  
  { path: 'ai', component: AiComponent },//
  { path: 'two-players', component: TwoPlayersComponent },//
  { path: 'about', component: AboutComponent },//

  ];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
