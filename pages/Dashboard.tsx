import React, {useState} from 'react';
import { useAuth } from '../AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import BrandFooter from '../components/BrandFooter';
import AdminAdvanceForm from '../components/AdminAdvanceForm';
import StaffAdvanceList from '../components/StaffAdvanceList';
import AdminReturnList from '../components/AdminReturnList';
import StaffManagement from '../components/StaffManagement';
import ReportsTab from '../components/ReportsTab';
import PasswordChangeForm from '../components/PasswordChangeForm';
import { LogOut, UserCog } from 'lucide-react';
import AdminCollectionManagement from '../components/AdminCollectionManagement';
import TransportPaymentTracking from '../components/TransportPaymentTracking';
import StaffCollectionEntry from '../components/StaffCollectionEntry';
import DataMigration from '../components/DataMigration';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setProfileOpen] = useState(false);

  if (!user) {
    return null; // Should not happen if routing is correct
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-mk-blue-primary text-white shadow-md p-4 sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">MK Marketing</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-sm hidden sm:inline">
              {user.name} ({user.role})
            </span>
             <Dialog open={isProfileOpen} onOpenChange={setProfileOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-mk-blue-dark hover:text-white">
                   <UserCog className="h-5 w-5" />
                   <span className="sr-only">Profile Settings</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                    <DialogTitle>My Profile</DialogTitle>
                </DialogHeader>
                <PasswordChangeForm onPasswordChanged={() => setProfileOpen(false)} />
              </DialogContent>
            </Dialog>
            <Button
              variant="destructive"
              size="sm"
              onClick={logout}
              className="bg-mk-orange-accent hover:bg-mk-orange-dark"
            >
              <LogOut className="mr-0 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-2 sm:p-4 md:p-6">
        <Tabs defaultValue="advances" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 h-auto">
            <TabsTrigger value="advances">Advances</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="transport">Transport</TabsTrigger>
            {isAdmin && <TabsTrigger value="approvals">Approvals</TabsTrigger>}
            {isAdmin && <TabsTrigger value="reports">Reports</TabsTrigger>}
            {isAdmin && <TabsTrigger value="users">Users</TabsTrigger>}
            {isAdmin && <TabsTrigger value="migration">Migrate</TabsTrigger>}
          </TabsList>

          <TabsContent value="advances">
            <Card><CardContent className="pt-6">
                {isAdmin && <AdminAdvanceForm />}
                <StaffAdvanceList />
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="collections">
             <Card><CardContent className="pt-6">
                 {isAdmin ? <AdminCollectionManagement /> : <StaffCollectionEntry />}
             </CardContent></Card>
          </TabsContent>
          
          <TabsContent value="transport">
             <Card><CardContent className="pt-6">
                <TransportPaymentTracking />
             </CardContent></Card>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="approvals">
              <Card><CardContent className="pt-6">
                  <AdminReturnList />
              </CardContent></Card>
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="reports">
              <Card><CardContent className="pt-6">
                  <ReportsTab />
              </CardContent></Card>
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="users">
              <Card><CardContent className="pt-6">
                  <StaffManagement />
              </CardContent></Card>
            </TabsContent>
          )}

          {isAdmin && (
             <TabsContent value="migration">
                <DataMigration />
             </TabsContent>
          )}
        </Tabs>
      </main>

      <BrandFooter />
    </div>
  );
};

export default Dashboard;