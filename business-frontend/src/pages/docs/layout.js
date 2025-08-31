import { renderIntroduction } from './content/getting-started/introduction.js';
import { renderCoreConcepts } from './content/getting-started/core-concepts.js';
import { renderDashboardOverview } from './content/dashboard-guide/overview.js';
import { renderDataExplorer } from './content/dashboard-guide/data-explorer.js';
import { renderApiKeys } from './content/dashboard-guide/api-keys.js';
import { renderTeamManagement } from './content/dashboard-guide/team-management.js';
import { renderApiIntro } from './content/api-reference/introduction.js';
import { renderApiAuth } from './content/api-reference/authentication.js';
import { renderApiSearch } from './content/api-reference/search-endpoint.js';
import { renderApiUnlock } from './content/api-reference/unlock-endpoint.js';
import { renderApiDownload } from './content/api-reference/download-endpoint.js';
import { renderApiBalance } from './content/api-reference/balance-endpoint.js';
import { renderApiSecurity } from './content/api-reference/security.js';

export const docPages = {
    'introduction': { 
        title: 'Introduction', 
        content: renderIntroduction, 
        toc: [ { id: 'mission', title: 'Our Mission' }, { id: 'for-teams', title: 'For AI Teams' }, { id: 'for-developers', title: 'For Developers' } ]
    },
    'core-concepts': { 
        title: 'Core Concepts', 
        content: renderCoreConcepts, 
        toc: [ { id: 'concepts', title: 'Core Concepts' }, { id: 'contributions', title: 'Contributions' }, { id: 'tokens', title: 'Tokens' }, { id: 'unlocking', title: 'Unlocking Data' } ]
    },
    'dashboard-overview': { 
        title: 'Dashboard Overview', 
        content: renderDashboardOverview, 
        toc: [ { id: 'dashboard', title: 'Dashboard Guide' }, { id: 'overview', title: 'Overview' }, { id: 'data-explorer', title: 'Data Explorer' }, { id: 'api-keys', title: 'API Keys' }, { id: 'team', title: 'Team Management' }, { id: 'plans', title: 'Plans & Billing' }, { id: 'settings', title: 'Settings' } ]
    },
    'data-explorer-guide': {
        title: 'Using the Data Explorer',
        content: renderDataExplorer,
        toc: [ { id: 'explorer', title: 'The Data Explorer' }, { id: 'filtering', title: 'Filtering Data' }, { id: 'previewing', title: 'Previewing Contributions' }, { id: 'unlocking', title: 'Unlocking & Downloading' } ]
    },
    'api-keys-guide': {
        title: 'Managing API Keys',
        content: renderApiKeys,
        toc: [ { id: 'api-keys', title: 'Managing API Keys' }, { id: 'generating', title: 'Generating a Key' }, { id: 'revoking', title: 'Revoking a Key' }, { id: 'security', title: 'Security Best Practices' } ]
    },
    'team-guide': {
        title: 'Team Management',
        content: renderTeamManagement,
        toc: [ { id: 'team', title: 'Team Management' }, { id: 'roles', title: 'Roles' }, { id: 'inviting', title: 'Inviting Members' }, { id: 'removing', title: 'Removing Members' } ]
    },
    'api-introduction': {
        title: 'API Introduction',
        content: renderApiIntro,
        toc: [ { id: 'introduction', title: 'API Introduction' }, { id: 'workflow', title: 'The Core Workflow' }, { id: 'rate-limits', title: 'Rate Limits' }, { id: 'versioning', title: 'Versioning' } ]
    },
    'api-authentication': {
        title: 'API Authentication',
        content: renderApiAuth,
        toc: [ { id: 'authentication', title: 'Authentication' }, { id: 'generating', title: 'Generating a Key' }, { id: 'making-requests', title: 'Making Requests' } ]
    },
    'search-endpoint': {
        title: 'Endpoint: Search',
        content: renderApiSearch,
        toc: [ { id: 'search', title: 'POST /search' }, { id: 'parameters', title: 'Parameters' }, { id: 'response', title: 'Response Object' }, { id: 'example', title: 'Example Request' } ]
    },
    'unlock-endpoint': {
        title: 'Endpoint: Unlock',
        content: renderApiUnlock,
        toc: [ { id: 'unlock', title: 'POST /unlock/{id}' }, { id: 'response', title: 'Response Object' }, { id: 'errors', title: 'Error Handling' }, { id: 'example', title: 'Example Request' } ]
    },
    'download-endpoint': {
        title: 'Endpoint: Download',
        content: renderApiDownload,
        toc: [ { id: 'download', title: 'GET /download/{id}' }, { id: 'response', title: 'Response' }, { id: 'example', title: 'Example Request' } ]
    },
     'balance-endpoint': {
        title: 'Endpoint: Balance',
        content: renderApiBalance,
        toc: [ { id: 'balance', title: 'GET /balance' }, { id: 'response', title: 'Response Object' }, { id: 'example', title: 'Example Request' } ]
    },
    'api-security': {
        title: 'API Security',
        content: renderApiSecurity,
        toc: [ { id: 'security', title: 'Security Best Practices' }, { id: 'key-management', title: 'Key Management' }, { id: 'monitoring', title: 'Monitoring Usage' } ]
    }
};

const getDocPath = (id) => `/docs/${id}`;

function renderSidebarContent(activePage) {
    const navLink = (id, name) => {
        const isActive = id === activePage;
        return `
            <a href="${getDocPath(id)}" class="block py-2 px-3 rounded-md text-sm transition-colors 
                ${isActive ? 'bg-white font-semibold text-primary shadow-sm' : 'text-text-body hover:bg-gray-50 hover:text-text-headings'}">
                ${name}
            </a>
        `;
    };

    return `
        <nav class="space-y-6">
            <div>
                <h4 class="px-3 text-xs font-bold uppercase text-text-muted tracking-wider mb-2">Getting Started</h4>
                <div class="space-y-1">
                    ${navLink('introduction', 'Introduction')}
                    ${navLink('core-concepts', 'Core Concepts')}
                </div>
            </div>
            <div>
                <h4 class="px-3 text-xs font-bold uppercase text-text-muted tracking-wider mb-2">Dashboard Guide</h4>
                <div class="space-y-1">
                    ${navLink('dashboard-overview', 'Overview')}
                    ${navLink('data-explorer-guide', 'Data Explorer')}
                    ${navLink('api-keys-guide', 'API Keys')}
                    ${navLink('team-guide', 'Team Management')}
                </div>
            </div>
             <div>
                <h4 class="px-3 text-xs font-bold uppercase text-text-muted tracking-wider mb-2">API Reference</h4>
                <div class="space-y-1">
                    ${navLink('api-introduction', 'Introduction')}
                    ${navLink('api-authentication', 'Authentication')}
                    ${navLink('search-endpoint', 'Endpoint: Search')}
                    ${navLink('unlock-endpoint', 'Endpoint: Unlock')}
                    ${navLink('download-endpoint', 'Endpoint: Download')}
                    ${navLink('balance-endpoint', 'Endpoint: Balance')}
                    ${navLink('api-security', 'Security')}
                </div>
            </div>
        </nav>
    `;
}

function renderOnPageNavContent(pageId) {
    const toc = docPages[pageId]?.toc || [];
    if (toc.length <= 1) return '';

    return `
        <nav>
            <h4 class="text-sm font-bold text-text-headings mb-4">On this page</h4>
            <ul class="space-y-2">
                ${toc.map(item => `
                    <li>
                        <a href="#${item.id}" class="block text-sm text-text-muted hover:text-text-body transition-colors">${item.title}</a>
                    </li>
                `).join('')}
            </ul>
        </nav>
    `;
}

export async function renderDocsLayout(pageId) {
    const pageKey = docPages[pageId] ? pageId : 'introduction';
    const page = docPages[pageKey];
    
    const contentHtml = await page.content();

    return `
        <div class="bg-background">
            <div class="container mx-auto px-6">
                <div class="relative flex lg:gap-8">
                    <aside class="hidden lg:block w-64 flex-shrink-0">
                        <div class="sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto py-10">
                            ${renderSidebarContent(pageKey)}
                        </div>
                    </aside>

                    <div class="flex-1 min-w-0 py-10">
                        <article class="prose prose-lg max-w-none prose-docs w-full max-w-4xl mx-auto">
                            ${contentHtml}
                        </article>
                    </div>

                    <aside class="hidden xl:block w-64 flex-shrink-0">
                        <div class="sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto py-10">
                            ${renderOnPageNavContent(pageKey)}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    `;
}