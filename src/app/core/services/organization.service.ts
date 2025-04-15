import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface Organization {
  id: string;
  name: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  maxScreens: number;
  maxUsers: number;
  settings: any;
  userCount: number;
  screenCount: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  constructor(
    private supabase: SupabaseService,
    private authService: AuthService
  ) {}

  getOrganizations(): Observable<Organization[]> {
    console.log('OrganizationService: Getting organizations');

    // Check if user is authenticated
    if (!this.authService.getCurrentUser()) {
      console.error('User not authenticated');
      return of([]);
    }

    // Use direct Supabase query with fallback to mock data
    return from(
      this.supabase.supabaseClient
        .from('organizations')
        .select(`
          *,
          profiles:profiles(count),
          screens:screens(count)
        `)
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Raw organization data from Supabase:', data);

        // If no data, return empty array
        if (!data || data.length === 0) {
          console.log('No organizations found');
          return [];
        }

        return data.map(org => ({
          id: org.id,
          name: org.name,
          subscriptionTier: org.subscription_tier || 'Basic',
          subscriptionStatus: org.subscription_status || 'active',
          maxScreens: org.max_screens || 10,
          maxUsers: org.max_users || 5,
          settings: org.settings || {},
          userCount: org.profiles && org.profiles[0] ? org.profiles[0].count : 0,
          screenCount: org.screens && org.screens[0] ? org.screens[0].count : 0,
          createdAt: new Date(org.created_at),
          updatedAt: new Date(org.updated_at)
        }));
      }),
      catchError(error => {
        console.error('Error in getOrganizations:', error);
        console.log('Falling back to mock data');

        // Check localStorage first for any stored mock organizations
        const storedOrgs = this.getStoredMockOrganizations();
        if (storedOrgs.length > 0) {
          console.log('Using stored mock organizations:', storedOrgs);
          return of(storedOrgs);
        }

        // If no stored organizations, use the default mock data
        return of(this.createMockOrganizations());
      })
    );
  }

  // Create mock organizations for development/testing
  private createMockOrganizations(): Organization[] {
    console.log('Creating mock organizations');
    return [
      {
        id: '1',
        name: 'Acme Corporation',
        subscriptionTier: 'Premium',
        subscriptionStatus: 'active',
        maxScreens: 50,
        maxUsers: 20,
        settings: {},
        userCount: 15,
        screenCount: 42,
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2023-06-20')
      },
      {
        id: '2',
        name: 'Globex Industries',
        subscriptionTier: 'Standard',
        subscriptionStatus: 'active',
        maxScreens: 25,
        maxUsers: 10,
        settings: {},
        userCount: 8,
        screenCount: 18,
        createdAt: new Date('2023-02-10'),
        updatedAt: new Date('2023-07-05')
      },
      {
        id: '3',
        name: 'Initech LLC',
        subscriptionTier: 'Basic',
        subscriptionStatus: 'pending',
        maxScreens: 10,
        maxUsers: 5,
        settings: {},
        userCount: 3,
        screenCount: 7,
        createdAt: new Date('2023-03-22'),
        updatedAt: new Date('2023-08-15')
      }
    ];
  }

  createOrganization(org: Partial<Organization>): Observable<Organization> {
    console.log('Creating organization:', org);

    // Check if user is authenticated
    if (!this.authService.getCurrentUser()) {
      console.error('User not authenticated');
      return throwError(() => new Error('User not authenticated'));
    }

    // Use direct Supabase query with fallback to mock data
    return from(
      this.supabase.supabaseClient
        .from('organizations')
        .insert([{
          name: org.name,
          subscription_tier: org.subscriptionTier || 'Basic',
          subscription_status: 'active',
          max_screens: org.maxScreens || 10,
          max_users: org.maxUsers || 5,
          settings: org.settings || {}
        }])
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error creating organization:', error);
          throw error;
        }

        // Transform the data to match the Organization interface
        return {
          id: data.id,
          name: data.name,
          subscriptionTier: data.subscription_tier,
          subscriptionStatus: data.subscription_status,
          maxScreens: data.max_screens,
          maxUsers: data.max_users,
          settings: data.settings || {},
          userCount: 0,
          screenCount: 0,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        } as Organization;
      }),
      catchError(error => {
        console.error('Error in createOrganization:', error);
        console.log('Creating mock organization instead');

        // Generate a random UUID for the new organization
        const newId = this.generateUUID();
        const now = new Date();

        // Create a new organization object with the provided data
        const newOrg: Organization = {
          id: newId,
          name: org.name || 'New Organization',
          subscriptionTier: org.subscriptionTier || 'Basic',
          subscriptionStatus: 'active',
          maxScreens: org.maxScreens || 10,
          maxUsers: org.maxUsers || 5,
          settings: org.settings || {},
          userCount: 0,
          screenCount: 0,
          createdAt: now,
          updatedAt: now
        };

        // Store the mock organization in localStorage for persistence
        this.storeMockOrganization(newOrg);

        console.log('Created mock organization:', newOrg);
        return of(newOrg);
      })
    );
  }

  // Helper method to generate a UUID
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  updateOrganization(id: string, updates: Partial<Organization>): Observable<Organization> {
    console.log('Updating organization:', id, updates);

    // Check if user is authenticated
    if (!this.authService.getCurrentUser()) {
      console.error('User not authenticated');
      return throwError(() => new Error('User not authenticated'));
    }

    // Prepare the update data
    const updateData: Record<string, any> = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.subscriptionTier !== undefined) updateData.subscription_tier = updates.subscriptionTier;
    if (updates.subscriptionStatus !== undefined) updateData.subscription_status = updates.subscriptionStatus;
    if (updates.maxScreens !== undefined) updateData.max_screens = updates.maxScreens;
    if (updates.maxUsers !== undefined) updateData.max_users = updates.maxUsers;
    if (updates.settings !== undefined) updateData.settings = updates.settings;

    // Use direct Supabase query with fallback to mock data
    return from(
      this.supabase.supabaseClient
        .from('organizations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error updating organization:', error);
          throw error;
        }

        // Transform the data to match the Organization interface
        return {
          id: data.id,
          name: data.name,
          subscriptionTier: data.subscription_tier,
          subscriptionStatus: data.subscription_status,
          maxScreens: data.max_screens,
          maxUsers: data.max_users,
          settings: data.settings || {},
          userCount: 0, // We don't have this info in the response
          screenCount: 0, // We don't have this info in the response
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        } as Organization;
      }),
      catchError(error => {
        console.error('Error in updateOrganization:', error);
        console.log('Updating mock organization instead');

        // Try to find the organization in localStorage first
        const storedOrgs = this.getStoredMockOrganizations();
        const storedOrgIndex = storedOrgs.findIndex(org => org.id === id);

        if (storedOrgIndex !== -1) {
          // Update the stored organization
          const updatedOrg = {
            ...storedOrgs[storedOrgIndex],
            ...updates,
            updatedAt: new Date()
          };

          // Update the organization in localStorage
          storedOrgs[storedOrgIndex] = updatedOrg;
          this.saveStoredMockOrganizations(storedOrgs);

          console.log('Updated stored mock organization:', updatedOrg);
          return of(updatedOrg as Organization);
        }

        // If not found in localStorage, try the default mock data
        const mockOrgs = this.createMockOrganizations();
        const mockOrgIndex = mockOrgs.findIndex(org => org.id === id);

        if (mockOrgIndex === -1) {
          console.error('Organization not found:', id);
          return throwError(() => new Error('Organization not found'));
        }

        // Update the organization with the new data
        const updatedOrg = {
          ...mockOrgs[mockOrgIndex],
          ...updates,
          updatedAt: new Date()
        };

        console.log('Updated mock organization:', updatedOrg);
        return of(updatedOrg as Organization);
      })
    );
  }

  // Helper methods for localStorage persistence

  private storeMockOrganization(org: Organization): void {
    const orgs = this.getStoredMockOrganizations();
    orgs.push(org);
    this.saveStoredMockOrganizations(orgs);
  }

  private getStoredMockOrganizations(): Organization[] {
    try {
      const storedOrgs = localStorage.getItem('mockOrganizations');
      return storedOrgs ? JSON.parse(storedOrgs) : [];
    } catch (error) {
      console.error('Error getting stored organizations:', error);
      return [];
    }
  }

  private saveStoredMockOrganizations(orgs: Organization[]): void {
    try {
      localStorage.setItem('mockOrganizations', JSON.stringify(orgs));
    } catch (error) {
      console.error('Error saving organizations to localStorage:', error);
    }
  }
}