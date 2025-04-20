import { TestBed } from '@angular/core/testing';
import { EventBusService } from '../../services/event-bus.service';
import { SuperAdminStatsService, SubscriptionPlan } from '../../services/super-admin-stats.service';
import { of } from 'rxjs';

describe('EventBusService for Subscription Plans', () => {
  let eventBusService: EventBusService;
  let statsServiceSpy: jasmine.SpyObj<SuperAdminStatsService>;
  
  beforeEach(() => {
    const spy = jasmine.createSpyObj('SuperAdminStatsService', [
      'updateSubscriptionPlan',
      'addSubscriptionPlan',
      'deleteSubscriptionPlan'
    ]);
    
    TestBed.configureTestingModule({
      providers: [
        EventBusService,
        { provide: SuperAdminStatsService, useValue: spy }
      ]
    });
    
    eventBusService = TestBed.inject(EventBusService);
    statsServiceSpy = TestBed.inject(SuperAdminStatsService) as jasmine.SpyObj<SuperAdminStatsService>;
  });
  
  it('should emit an event when a subscription plan is updated', (done) => {
    // Arrange
    const planId = '123';
    const updatedPlan: SubscriptionPlan = {
      id: planId,
      name: 'Updated Plan',
      price: 29.99,
      max_screens: 5,
      max_users: 10,
      features: ['Feature 1', 'Feature 2']
    };
    
    statsServiceSpy.updateSubscriptionPlan.and.returnValue(of(updatedPlan));
    
    // Subscribe to the event
    eventBusService.on('subscription-plan-updated').subscribe(event => {
      // Assert
      expect(event.type).toBe('subscription-plan-updated');
      expect(event.payload).toEqual(updatedPlan);
      done();
    });
    
    // Act - Simulate the service emitting the event
    eventBusService.emit({
      type: 'subscription-plan-updated',
      payload: updatedPlan
    });
  });
  
  it('should emit an event when a new subscription plan is added', (done) => {
    // Arrange
    const newPlan: SubscriptionPlan = {
      id: '456',
      name: 'New Plan',
      price: 19.99,
      max_screens: 3,
      max_users: 5,
      features: ['Feature A', 'Feature B']
    };
    
    statsServiceSpy.addSubscriptionPlan.and.returnValue(of(newPlan));
    
    // Subscribe to the event
    eventBusService.on('subscription-plan-added').subscribe(event => {
      // Assert
      expect(event.type).toBe('subscription-plan-added');
      expect(event.payload).toEqual(newPlan);
      done();
    });
    
    // Act - Simulate the service emitting the event
    eventBusService.emit({
      type: 'subscription-plan-added',
      payload: newPlan
    });
  });
  
  it('should emit an event when a subscription plan is deleted', (done) => {
    // Arrange
    const planId = '789';
    
    statsServiceSpy.deleteSubscriptionPlan.and.returnValue(of(true));
    
    // Subscribe to the event
    eventBusService.on('subscription-plan-deleted').subscribe(event => {
      // Assert
      expect(event.type).toBe('subscription-plan-deleted');
      expect(event.payload).toEqual(planId);
      done();
    });
    
    // Act - Simulate the service emitting the event
    eventBusService.emit({
      type: 'subscription-plan-deleted',
      payload: planId
    });
  });
});
