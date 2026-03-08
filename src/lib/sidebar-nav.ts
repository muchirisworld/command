import {
	Box,
	HomeIcon,
	PackageReceiveIcon,
	Settings01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { useRouterState } from "@tanstack/react-router";
import type { FileRouteTypes } from "@/routeTree.gen";

type AdminRoute =
	| "/"
	| Extract<FileRouteTypes["to"], `/${string}`>;

export type SidebarNavItem =
	| {
			kind: "item";
			title: string;
			url: AdminRoute;
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
			url: AdminRoute;
			icon: IconSvgElement;
	  }
	| {
			kind: "hidden";
	  };

export const adminNavConfig: Record<string, SidebarNavItemConfig> = {
	"/": {
		kind: "item",
		title: "Dashboard",
		url: "/",
		icon: HomeIcon,
	},
	"/catalog/products": {
		kind: "item",
		title: "Products",
		url: "/catalog/products",
		icon: Box,
	},
	"/inventory/receive": {
		kind: "item",
		title: "Receive Stock",
		url: "/inventory/receive",
		icon: PackageReceiveIcon,
	},
	"/settings": {
		kind: "item",
		title: "Settings",
		url: "/settings",
		icon: Settings01Icon,
	},
};

export function useSidebarItems(): Array<SidebarNavItem> {
	const location = useRouterState({
		select: (s) => s.location.pathname,
	});

	return (
		Object.entries(adminNavConfig) as Array<
			[AdminRoute, SidebarNavItemConfig]
		>
	)
		.filter(([_, x]) => x.kind === "item")
		.map(([route, item]) => ({
			...item,
			isActive: location === route || location.startsWith(route === "/" ? "/_never_match" : route),
		}));
}
