import { useAuth } from "@clerk/tanstack-react-start";
import {
	Bell,
	Card,
	ComputerIcon,
	CreditCardIcon,
	EyeIcon,
	File01Icon,
	HelpCircleIcon,
	KeyboardIcon,
	LanguageCircleIcon,
	LayoutIcon,
	LogoutIcon,
	MailIcon,
	MoonIcon,
	NotificationIcon,
	PaintBoardIcon,
	SettingsIcon,
	ShieldIcon,
	SunIcon,
	UserIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useId, useState } from "react";
import {
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useThemeStore from "../../lib/themeStore";

type ProfileDropdownItem = {
	icon: IconSvgElement;
	name: string;
	action: () => void;
};

const profileDropdownItems: Array<ProfileDropdownItem> = [
	{
		icon: UserIcon,
		name: "Profile",
		action: () => {
			console.log("Profile clicked");
		},
	},
	{
		icon: SettingsIcon,
		name: "Settings",
		action: () => {
			console.log("Settings clicked");
		},
	},
	{
		icon: Card,
		name: "Billing",
		action: () => {
			console.log("Billing clicked");
		},
	},
	{
		icon: Bell,
		name: "Notifications",
		action: () => {
			console.log("Notification clicked");
		},
	},
];

export function UserProfile() {
	const { signOut } = useAuth();
	const theme = useThemeStore((s) => s.theme);
	const setTheme = useThemeStore((s) => s.setTheme);

	const [notifications, setNotifications] = useState({
		email: true,
		sms: false,
		push: true,
	});

	useEffect(() => {
		// initialize theme on mount (reads localStorage and applies class)
		try {
			useThemeStore.getState().init();
		} catch (_e) {}
	}, []);


	return (
		<DropdownMenuContent className={"w-full"} side="right">
			<DropdownMenuGroup>
				<DropdownMenuLabel>View</DropdownMenuLabel>
				<DropdownMenuCheckboxItem
					checked={notifications.email}
					onCheckedChange={(checked) =>
						setNotifications({
							...notifications,
							email: checked === true,
						})
					}
				>
					<HugeiconsIcon icon={EyeIcon} strokeWidth={2} />
					Show Sidebar
				</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem
					checked={notifications.sms}
					onCheckedChange={(checked) =>
						setNotifications({
							...notifications,
							sms: checked === true,
						})
					}
				>
					<HugeiconsIcon icon={LayoutIcon} strokeWidth={2} />
					Show Status Bar
				</DropdownMenuCheckboxItem>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<HugeiconsIcon icon={PaintBoardIcon} strokeWidth={2} />
						Theme
					</DropdownMenuSubTrigger>
					<DropdownMenuPortal>
						<DropdownMenuSubContent>
							<DropdownMenuGroup>
								<DropdownMenuLabel>Appearance</DropdownMenuLabel>
								<DropdownMenuRadioGroup
									value={theme}
									onValueChange={setTheme}
								>
									<DropdownMenuRadioItem value="light">
										<HugeiconsIcon icon={SunIcon} strokeWidth={2} />
										Light
									</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="dark">
										<HugeiconsIcon icon={MoonIcon} strokeWidth={2} />
										Dark
									</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="system">
										<HugeiconsIcon
											icon={ComputerIcon}
											strokeWidth={2}
										/>
										System
									</DropdownMenuRadioItem>
								</DropdownMenuRadioGroup>
							</DropdownMenuGroup>
						</DropdownMenuSubContent>
					</DropdownMenuPortal>
				</DropdownMenuSub>
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
			<DropdownMenuGroup>
				<DropdownMenuLabel>Account</DropdownMenuLabel>
				<DropdownMenuItem>
					<HugeiconsIcon icon={UserIcon} strokeWidth={2} />
					Profile
					<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} />
					Billing
				</DropdownMenuItem>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<HugeiconsIcon icon={SettingsIcon} strokeWidth={2} />
						Settings
					</DropdownMenuSubTrigger>
					<DropdownMenuPortal>
						<DropdownMenuSubContent>
							<DropdownMenuGroup>
								<DropdownMenuLabel>Preferences</DropdownMenuLabel>
								<DropdownMenuItem>
									<HugeiconsIcon
										icon={KeyboardIcon}
										strokeWidth={2}
									/>
									Keyboard Shortcuts
								</DropdownMenuItem>
								<DropdownMenuItem>
									<HugeiconsIcon
										icon={LanguageCircleIcon}
										strokeWidth={2}
									/>
									Language
								</DropdownMenuItem>
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>
										<HugeiconsIcon
											icon={NotificationIcon}
											strokeWidth={2}
										/>
										Notifications
									</DropdownMenuSubTrigger>
									<DropdownMenuPortal>
										<DropdownMenuSubContent>
											<DropdownMenuGroup>
												<DropdownMenuLabel>
													Notification Types
												</DropdownMenuLabel>
												<DropdownMenuCheckboxItem
													checked={notifications.push}
													onCheckedChange={(checked) =>
														setNotifications({
															...notifications,
															push: checked === true,
														})
													}
												>
													<HugeiconsIcon
														icon={NotificationIcon}
														strokeWidth={2}
													/>
													Push Notifications
												</DropdownMenuCheckboxItem>
												<DropdownMenuCheckboxItem
													checked={notifications.email}
													onCheckedChange={(checked) =>
														setNotifications({
															...notifications,
															email: checked === true,
														})
													}
												>
													<HugeiconsIcon
														icon={MailIcon}
														strokeWidth={2}
													/>
													Email Notifications
												</DropdownMenuCheckboxItem>
											</DropdownMenuGroup>
										</DropdownMenuSubContent>
									</DropdownMenuPortal>
								</DropdownMenuSub>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem>
									<HugeiconsIcon icon={ShieldIcon} strokeWidth={2} />
									Privacy & Security
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuSubContent>
					</DropdownMenuPortal>
				</DropdownMenuSub>
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
			<DropdownMenuGroup>
				<DropdownMenuItem>
					<HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} />
					Help & Support
				</DropdownMenuItem>
				<DropdownMenuItem>
					<HugeiconsIcon icon={File01Icon} strokeWidth={2} />
					Documentation
				</DropdownMenuItem>
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
			<DropdownMenuGroup>
				<DropdownMenuItem
					variant="destructive"
					onClick={() => signOut()}
				>
					<HugeiconsIcon icon={LogoutIcon} strokeWidth={2} />
					Sign Out
					<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuGroup>
		</DropdownMenuContent>
	);
}
