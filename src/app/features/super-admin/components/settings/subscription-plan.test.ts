// src/app/features/super-admin/components/settings/subscription-plan.test.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { SettingsComponent } from './settings.component';
import { EditPlanDialogComponent } from './edit-plan-dialog.component';
import { SuperAdminStatsService } from '../../services/super-admin-stats.service';

describe('Subscription Plan Functionality', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let statsServiceSpy: jasmine.SpyObj<SuperAdminStatsService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('SuperAdminStatsService', [
      'getSubscriptionPlans',
      'addSubscriptionPlan',
      'updateSubscriptionPlan',
      'deleteSubscriptionPlan',
      'getSystemSettings',
      'updateSystemSettings'
    ]);

    await TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: SuperAdminStatsService, useValue: spy }
      ]
    }).compileComponents();

    statsServiceSpy = TestBed.inject(SuperAdminStatsService) as jasmine.SpyObj<SuperAdminStatsService>;
    
    // Mock the getSubscriptionPlans method
    statsServiceSpy.getSubscriptionPlans.and.returnValue(of([
      { id: '1', name: 'Basic', price: 9.99, max_screens: 1, max_users: 2 },
      { id: '2', name: 'Standard', price: 29.99, max_screens: 5, max_users: 10, is_popular: true },
      { id: '3', name: 'Premium', price: 99.99, max_screens: 20, max_users: 50 }
    ]));
    
    // Mock the getSystemSettings method
    statsServiceSpy.getSystemSettings.and.returnValue(of({
      system_name: 'Digital Signage Platform',
      support_email: 'support@example.com',
      timezone: 'Europe/London',
      maintenance_mode: false
    }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load subscription plans on init', () => {
    expect(statsServiceSpy.getSubscriptionPlans).toHaveBeenCalled();
    expect(component.subscriptionPlans.length).toBe(3);
  });

  it('should add a new subscription plan', () => {
    const newPlan = {
      name: 'Enterprise',
      price: 199.99,
      max_screens: 50,
      max_users: 100,
      description: 'For large organizations',
      features: ['Unlimited storage', '24/7 support', 'Custom integrations']
    };
    
    statsServiceSpy.addSubscriptionPlan.and.returnValue(of({
      id: '4',
      ...newPlan
    }));
    
    component.addSubscriptionPlan(newPlan);
    
    expect(statsServiceSpy.addSubscriptionPlan).toHaveBeenCalledWith(newPlan);
    expect(component.subscriptionPlans.length).toBe(4);
    expect(component.subscriptionPlans[3].name).toBe('Enterprise');
  });

  it('should update an existing subscription plan', () => {
    const updatedPlan = {
      id: '2',
      name: 'Standard Plus',
      price: 39.99,
      max_screens: 10,
      max_users: 15
    };
    
    statsServiceSpy.updateSubscriptionPlan.and.returnValue(of(updatedPlan));
    
    component.updateSubscriptionPlan('2', updatedPlan);
    
    expect(statsServiceSpy.updateSubscriptionPlan).toHaveBeenCalledWith('2', updatedPlan);
    expect(component.subscriptionPlans.find(p => p.id === '2')?.name).toBe('Standard Plus');
    expect(component.subscriptionPlans.find(p => p.id === '2')?.price).toBe(39.99);
  });

  it('should delete a subscription plan', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    
    statsServiceSpy.deleteSubscriptionPlan.and.returnValue(of(true));
    
    component.deleteSubscriptionPlan('3');
    
    expect(statsServiceSpy.deleteSubscriptionPlan).toHaveBeenCalledWith('3');
    expect(component.subscriptionPlans.length).toBe(2);
    expect(component.subscriptionPlans.find(p => p.id === '3')).toBeUndefined();
  });

  it('should handle errors when loading subscription plans', () => {
    statsServiceSpy.getSubscriptionPlans.and.returnValue(throwError(() => new Error('Failed to load plans')));
    
    component.loadSubscriptionPlans();
    
    expect(component.planErrorMessage).toBeTruthy();
    expect(component.isLoadingPlans).toBe(false);
  });
});

describe('EditPlanDialogComponent', () => {
  let component: EditPlanDialogComponent;
  let fixture: ComponentFixture<EditPlanDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<EditPlanDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        EditPlanDialogComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { plan: {} } }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPlanDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the dialog component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form for new plan', () => {
    expect(component.isNewPlan).toBeTrue();
    expect(component.planForm.get('name')?.value).toBe('');
    expect(component.planForm.get('price')?.value).toBe(0);
  });

  it('should add and remove features', () => {
    expect(component.featuresArray.length).toBe(1);
    
    component.addFeature('Feature 1');
    expect(component.featuresArray.length).toBe(2);
    expect(component.featuresArray.at(1).value).toBe('Feature 1');
    
    component.removeFeature(0);
    expect(component.featuresArray.length).toBe(1);
    expect(component.featuresArray.at(0).value).toBe('Feature 1');
  });

  it('should save the form data', () => {
    component.planForm.patchValue({
      name: 'Test Plan',
      price: 19.99,
      maxScreens: 3,
      maxUsers: 5,
      description: 'Test description',
      isPopular: true,
      isActive: true
    });
    
    component.addFeature('Feature 1');
    component.addFeature('Feature 2');
    
    component.save();
    
    expect(dialogRefSpy.close).toHaveBeenCalled();
    const planData = dialogRefSpy.close.calls.mostRecent().args[0];
    expect(planData.name).toBe('Test Plan');
    expect(planData.price).toBe(19.99);
    expect(planData.features.length).toBe(2);
    expect(planData.is_popular).toBeTrue();
  });
});
