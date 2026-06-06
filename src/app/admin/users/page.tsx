"use client";

import { useAdminUsers } from "@/hooks/useAdminUsers";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Trash2,
    Eye,
    Loader2,
    UserPlus,
    ShieldAlert,
    ShieldCheck,
    Pencil
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function UsersManagementPage() {
    const { users, isLoading, deleteUser, freezeUser } = useAdminUsers();

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground text-sm">
                        Detailed directory of all registered clients and staff members.
                    </p>
                </div>
                <Button className="gap-2">
                    <UserPlus className="h-4 w-4" /> Add New User
                </Button>
            </div>

            <Card className="border-none shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" /> Active Users
                    </CardTitle>
                    <div className="text-xs text-muted-foreground">
                        Total: {users.length}
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={`user-${user.id}`} className={!user.is_active ? "opacity-60 grayscale-[0.5]" : ""}>
                                    <TableCell className="font-medium whitespace-nowrap">
                                        {user.first_name} {user.last_name}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">{user.email}</TableCell>
                                    <TableCell className="text-xs">{user.phone_number || "—"}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.is_active ? "default" : "destructive"} className="text-[10px] px-1.5 py-0">
                                            {user.is_active ? "Active" : "Frozen"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="icon" className="h-8 w-8">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle>Full Profile: {user.first_name}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 py-4">
                                                        {Object.entries(user).map(([key, value]) => (
                                                            <div key={`field-${key}`} className="flex flex-col border-b py-2">
                                                                <span className="text-[10px] font-bold uppercase text-muted-foreground/70">{key.replace(/_/g, " ")}</span>
                                                                <span className="text-sm font-medium break-all">
                                                                    {value === null ? "null" : String(value)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                                                <Link href={`/admin/users/${user.id}/edit`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>

                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="h-8 w-8"
                                                title={user.is_active ? "Freeze Account" : "Unfreeze Account"}
                                                onClick={() => freezeUser(user.id, user.is_active)}
                                            >
                                                {user.is_active ? (
                                                    <ShieldAlert className="h-4 w-4 text-orange-600" />
                                                ) : (
                                                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                                                )}
                                            </Button>

                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => {
                                                    if (confirm("Permanently delete this user? Action cannot be undone.")) {
                                                        deleteUser(user.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                        No users found in database.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
