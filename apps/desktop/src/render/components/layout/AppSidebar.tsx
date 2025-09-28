import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database, ChevronRight, Folder, Network, Clock, MapPin } from 'lucide-react';
import { MicrosoftAccess } from '@/render/components/icons/MicrosoftAccess';
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/render/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/render/components/ui/collapsible';
import { usePageContext } from '@/render/contexts/PageContext';
import { PageDefinition, SidebarSection } from '@/render/registry/types';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const location = useLocation();
  const { getVisibleSections, getPagesForSection } = usePageContext();
  const { state, setOpen } = useSidebar();

  // Get visible sections and their pages
  const sections = useMemo(() => {
    return getVisibleSections();
  }, [getVisibleSections]);

  // Get section icon based on section id
  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'legacy':
        return MicrosoftAccess;
      case 'main':
        return Database;
      case 'analytics-network':
        return Network;
      case 'analytics-time':
        return Clock;
      case 'analytics-space':
        return MapPin;
      case 'development':
        return Folder;
      default:
        return Folder;
    }
  };

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="w-full justify-start" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center">
                  <img src={`${import.meta.env.BASE_URL}logo-192.png`} alt="CBDB Logo" className="w-full h-full object-contain rounded-lg" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">CBDB Desktop</span>
                  <span className="truncate text-xs text-muted-foreground">Historical Database</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <div className="px-2">
        <SidebarSeparator className="!mx-0" />
      </div>

      <SidebarContent>

        {/* Dynamic sections from PageRegistry */}
        {sections
          .filter(section => section.id !== 'settings') // Settings go to footer
          .map((section) => {
            const sectionPages = getPagesForSection(section.id);
            const SectionIcon = getSectionIcon(section.id);

            // If section has no pages, don't render it
            if (sectionPages.length === 0) return null;

            return (
              <SidebarGroup key={section.id}>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <Collapsible
                      defaultOpen={!section.defaultCollapsed}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={section.label}
                            onClick={() => {
                              // If sidebar is collapsed, expand it first
                              // The collapsible will handle its own open state
                              if (state === 'collapsed') {
                                setOpen(true);
                              }
                            }}
                          >
                            <SectionIcon className="size-4" />
                            <span>{section.label}</span>
                            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {sectionPages.map((page) => {
                              const Icon = page.icon;
                              return (
                                <SidebarMenuSubItem key={page.id}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={location.pathname === page.path}
                                    tooltip={page.sidebar?.tooltip || page.metadata?.description}
                                  >
                                    <Link to={page.path}>
                                      <Icon className="size-4" />
                                      <span>{page.title}</span>
                                      {page.sidebar?.badge && (
                                        <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                          {typeof page.sidebar.badge === 'function'
                                            ? page.sidebar.badge()
                                            : page.sidebar.badge}
                                        </span>
                                      )}
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
      </SidebarContent>

      <div className="px-2">
        <SidebarSeparator className="!mx-0" />
      </div>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Settings section pages go to footer */}
              {getPagesForSection('settings').map((page) => {
                const Icon = page.icon;
                return (
                  <SidebarMenuItem key={page.id}>
                    <SidebarMenuButton
                      asChild
                      size="default"
                      isActive={location.pathname === page.path}
                      tooltip={page.sidebar?.tooltip || page.metadata?.description || page.title}
                    >
                      <Link to={page.path}>
                        <Icon className="size-4" />
                        <span>{page.title}</span>
                        {page.sidebar?.badge && (
                          <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            {typeof page.sidebar.badge === 'function'
                              ? page.sidebar.badge()
                              : page.sidebar.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>

      <SidebarRail className="!right-0 translate-x-0" />
    </Sidebar>
  );
}

export default AppSidebar;