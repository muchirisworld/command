import { OrganizationSwitcher, useUser } from "@clerk/tanstack-react-start";
import { Command } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { useSidebarItems } from "@/lib/sidebar-nav";
import { cn } from "@/lib/utils";
import { UserProfile } from "../elements/user-profile";

const AppSidebar = () => {
	const { user } = useUser();
	const { open } = useSidebar();
	const sidebarNavItems = useSidebarItems();
	const mainNavItems = sidebarNavItems.filter((x) => x.kind === "item");

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<div
							className={cn(
								"flex items-center gap-2 px-2 py-2",
								!open && "justify-center px-0",
							)}
						>
							{open ? (
								<OrganizationSwitcher
									appearance={{
										elements: {
											rootBox: "w-full",
											organizationSwitcherTrigger:
												"w-full justify-start px-2 py-1 border border-border bg-background hover:bg-muted transition-colors",
										},
									}}
								/>
							) : (
								<div className="flex h-8 w-8 items-center justify-center rounded-none border border-border bg-background shadow-sm">
									<HugeiconsIcon icon={Command} size={16} />
								</div>
							)}
						</div>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{mainNavItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<Link to={item.url} className="w-full">
										<SidebarMenuButton
											isActive={item.isActive}
											tooltip={item.title}
											className="cursor-pointer"
										>
											<HugeiconsIcon icon={item.icon} />
											<span>{item.title}</span>
										</SidebarMenuButton>
									</Link>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger
								render={
									<SidebarMenuButton
										size="lg"
										className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
									>
										<Avatar className="h-8 w-8 rounded-none border">
											<AvatarImage
												src={user?.imageUrl}
												alt={user?.fullName || "User Avatar"}
											/>
											<AvatarFallback className="rounded-none">
												{user?.fullName?.substring(0, 2).toUpperCase() || "U"}
											</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold">
												{user?.fullName || "User"}
											</span>
											<span className="truncate text-xs text-muted-foreground">
												{user?.primaryEmailAddress?.emailAddress || "No Email"}
											</span>
										</div>
									</SidebarMenuButton>
								}
							/>
							<UserProfile />
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
};

export default AppSidebar;
