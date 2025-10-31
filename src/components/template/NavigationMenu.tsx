import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  NavigationMenu as NavigationMenuBase,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";
import ToggleTheme from "../ToggleTheme";

export default function NavigationMenu() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between px-2 py-2 border-b">
      <NavigationMenuBase className="text-muted-foreground">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link to="/">POS</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link to="/products">Products</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link to="/second">{t("titleSecondPage")}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenuBase>
      <ToggleTheme />
    </div>
  );
}
