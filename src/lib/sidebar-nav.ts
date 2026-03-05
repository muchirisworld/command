import {
	Box,
	HomeIcon,
	PackageReceiveIcon,
	Settings01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { useRouterState } from "@tanstack/react-router";
import type { FileRouteTypes } from "@/routeTree.gen";

type DashboardRoute =
	| "/dashboard"
	| Extract<FileRouteTypes["to"], `/dashboard/${string}`>;

export type SidebarNavItem =
	| {
			kind: "item";
			title: string;
			url: DashboardRoute;
			icon: IconSvgElement;
			isActive: boolean;
	  }
	| {
			kind: "hidden";
	  };

type SidebarNavItemConfig =
	| {
			kind: "item";
			title: string;
			url: DashboardRoute;
			icon: IconSvgElement;
	  }
	| {
			kind: "hidden";
	  };

export const dashboardNavConfig: Record<string, SidebarNavItemConfig> = {
	"/dashboard": {
		kind: "item",
		title: "Overview",
		url: "/dashboard",
		icon: HomeIcon,
	},
	"/dashboard/catalog/products": {
		kind: "item",
		title: "Products",
		url: "/dashboard/catalog/products",
		icon: Box,
	},
	"/dashboard/inventory/receive": {
		kind: "item",
		title: "Receive Stock",
		url: "/dashboard/inventory/receive",
		icon: PackageReceiveIcon,
	},
	"/dashboard/settings": {
		kind: "item",
		title: "Settings",
		url: "/dashboard/settings",
		icon: Settings01Icon,
	},
};

export function useSidebarItems(): Array<SidebarNavItem> {
	const location = useRouterState({
		select: (s) => s.location.pathname,
	});

	return (
		Object.entries(dashboardNavConfig) as Array<
			[DashboardRoute, SidebarNavItemConfig]
		>
	)
		.filter(([_, x]) => x.kind === "item")
		.map(([route, item]) => ({
			...item,
			isActive: location === route || location.startsWith(`${route}/`),
		}));
}
