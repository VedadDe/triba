import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoPlayersComponent } from './two-players.component';

describe('TwoPlayersComponent', () => {
  let component: TwoPlayersComponent;
  let fixture: ComponentFixture<TwoPlayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TwoPlayersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TwoPlayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
