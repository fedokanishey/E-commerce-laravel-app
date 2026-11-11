import { Head } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import { Avatar } from '@/components/atoms/avatar';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Checkbox } from '@/components/atoms/checkbox';
import { Icon, type IconName } from '@/components/atoms/icon';
import { Input } from '@/components/atoms/input';
import { Price } from '@/components/atoms/price';
import { Radio } from '@/components/atoms/radio';
import { Rating } from '@/components/atoms/rating';
import { Select } from '@/components/atoms/select';
import { Skeleton } from '@/components/atoms/skeleton';
import { Spinner } from '@/components/atoms/spinner';
import { StockStatus } from '@/components/atoms/stock-status';
import { Switch } from '@/components/atoms/switch';
import { Textarea } from '@/components/atoms/textarea';
import { TextLink } from '@/components/atoms/text-link';
import { Alert } from '@/components/molecules/alert';
import { Breadcrumbs } from '@/components/molecules/breadcrumbs';
import { Drawer } from '@/components/molecules/drawer';
import { EmptyState } from '@/components/molecules/empty-state';
import { Modal } from '@/components/molecules/modal';
import { Pagination } from '@/components/molecules/pagination';
import { QuantityStepper } from '@/components/molecules/quantity-stepper';
import { SearchField } from '@/components/molecules/search-field';
import { SectionHeading } from '@/components/molecules/section-heading';
import { StatCard } from '@/components/molecules/stat-card';
import { Tabs } from '@/components/molecules/tabs';
import { ProductGrid } from '@/components/organisms/product-grid';
import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';
import { cn } from '@/lib/utils';
import type { ProductCardData } from '@/types/ui';

const palette = [
    { name: 'Canvas', token: 'bg-canvas', className: 'bg-canvas' },
    { name: 'Surface', token: 'bg-surface', className: 'bg-surface' },
    { name: 'Ink', token: 'bg-ink', className: 'bg-ink' },
    {
        name: 'Brand',
        token: 'bg-brand-solid',
        className: 'bg-brand-solid',
    },
    { name: 'Brand soft', token: 'bg-brand-soft', className: 'bg-brand-soft' },
    {
        name: 'Muted',
        token: 'bg-surface-muted',
        className: 'bg-surface-muted',
    },
    { name: 'Warning', token: 'bg-warning-soft', className: 'bg-warning-soft' },
    { name: 'Danger', token: 'bg-danger-soft', className: 'bg-danger-soft' },
] as const;

const iconNames: IconName[] = [
    'search',
    'shopping-bag',
    'heart',
    'user',
    'package',
    'truck',
    'shield-check',
    'star',
    'sliders',
    'bell',
];

const sampleProducts: ProductCardData[] = [
    {
        id: 1,
        name: 'Everyday Canvas Tote',
        href: '#',
        price: 48,
        compareAtPrice: 60,
        currency: 'USD',
        rating: 4.6,
        reviewCount: 128,
        stockStatus: 'in-stock',
        badge: 'New',
        sellerName: 'North & Pine',
    },
    {
        id: 2,
        name: 'Stoneware Pour-Over Set',
        href: '#',
        price: 64,
        currency: 'USD',
        rating: 4.8,
        reviewCount: 86,
        stockStatus: 'low-stock',
        sellerName: 'Kiln Studio',
    },
    {
        id: 3,
        name: 'Merino Ribbed Beanie',
        href: '#',
        price: 32,
        compareAtPrice: 40,
        currency: 'USD',
        rating: 4.4,
        reviewCount: 54,
        stockStatus: 'in-stock',
        sellerName: 'Field Notes',
    },
    {
        id: 4,
        name: 'Walnut Desk Tray',
        href: '#',
        price: 52,
        currency: 'USD',
        rating: 4.9,
        reviewCount: 31,
        stockStatus: 'out-of-stock',
        sellerName: 'Grain & Co.',
    },
    {
        id: 5,
        name: 'Linen Table Runner',
        href: '#',
        price: 38,
        compareAtPrice: 46,
        currency: 'USD',
        rating: 4.7,
        reviewCount: 72,
        stockStatus: 'in-stock',
        sellerName: 'House of Loom',
    },
    {
        id: 6,
        name: 'Brass Reading Lamp',
        href: '#',
        price: 120,
        currency: 'USD',
        rating: 4.5,
        reviewCount: 44,
        stockStatus: 'backorder',
        sellerName: 'Atelier North',
    },
    {
        id: 7,
        name: 'Recycled Glass Carafe',
        href: '#',
        price: 29,
        currency: 'USD',
        rating: 4.3,
        reviewCount: 19,
        stockStatus: 'in-stock',
        badge: 'Low impact',
        sellerName: 'Clear Works',
    },
    {
        id: 8,
        name: 'Soft Wool Throw',
        href: '#',
        price: 86,
        compareAtPrice: 110,
        currency: 'USD',
        rating: 4.8,
        reviewCount: 63,
        stockStatus: 'low-stock',
        sellerName: 'North & Pine',
    },
];

const sectionLinks = [
    { label: 'Foundations', href: '#foundations' },
    { label: 'Atoms', href: '#atoms' },
    { label: 'Forms', href: '#forms' },
    { label: 'Feedback', href: '#feedback' },
    { label: 'Navigation', href: '#navigation' },
    { label: 'Products', href: '#products' },
    { label: 'Dashboard', href: '#dashboard' },
];

type SectionProps = {
    id: string;
    eyebrow: string;
    title: string;
    description?: string;
    children: ReactNode;
};

function Section({ id, eyebrow, title, description, children }: SectionProps) {
    return (
        <section id={id} className="border-line scroll-mt-28 border-t pt-10">
            <SectionHeading
                eyebrow={eyebrow}
                title={title}
                description={description}
            />
            <div className="mt-6">{children}</div>
        </section>
    );
}

function Panel({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'rounded-card border-line bg-surface border p-5',
                className,
            )}
        >
            {children}
        </div>
    );
}

function Subheading({ children }: { children: ReactNode }) {
    return (
        <h3 className="text-eyebrow text-ink-subtle mb-3 uppercase">
            {children}
        </h3>
    );
}

export default function DesignSystem() {
    const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
    const [cartCount, setCartCount] = useState(2);
    const [wishlistedIds, setWishlistedIds] = useState<
        Set<ProductCardData['id']>
    >(new Set([2]));
    const [lastAdded, setLastAdded] = useState<string | null>(null);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [productLayout, setProductLayout] = useState<'grid' | 'list'>('grid');
    const [quantity, setQuantity] = useState(2);
    const [searchQuery, setSearchQuery] = useState('');
    const [submittedSearch, setSubmittedSearch] = useState('');
    const [tab, setTab] = useState('overview');
    const [page, setPage] = useState(3);
    const [modalOpen, setModalOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [alertVisible, setAlertVisible] = useState(true);
    const [agree, setAgree] = useState(true);
    const [contactMethod, setContactMethod] = useState('email');
    const [notifications, setNotifications] = useState(true);
    const [freeDelivery, setFreeDelivery] = useState(true);
    const [category, setCategory] = useState('all');

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setSubmittedSearch(value);
    };

    const handleToggleWishlist = (product: ProductCardData) => {
        setWishlistedIds((current) => {
            const next = new Set(current);

            if (next.has(product.id)) {
                next.delete(product.id);
            } else {
                next.add(product.id);
            }

            return next;
        });
    };

    const handleAddToCart = (product: ProductCardData) => {
        setCartCount((current) => current + 1);
        setLastAdded(product.name);
    };

    const visibleProducts =
        productLayout === 'grid' ? sampleProducts : sampleProducts.slice(0, 3);

    return (
        <div dir={direction} className="bg-canvas text-ink min-h-screen">
            <Head title="Design System" />

            <SiteHeader
                user={{ name: 'Amina Yusuf' }}
                cartCount={cartCount}
                wishlistCount={wishlistedIds.size}
                onSearch={handleSearch}
            />

            <div className="ds-container pt-10 lg:pt-16">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <Badge variant="brand">Phase 2 · Design system</Badge>

                        <h1 className="text-display text-ink mt-4 max-w-3xl">
                            A calm foundation for a busy marketplace.
                        </h1>

                        <p className="text-body text-ink-muted mt-4 max-w-2xl">
                            Atoms, molecules, and organisms for the storefront,
                            customer account, and seller workspace. Built with
                            semantic tokens, logical properties, and accessible
                            interaction states.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div
                            role="group"
                            aria-label="Preview direction"
                            className="rounded-control border-line bg-surface inline-flex border p-1"
                        >
                            <Button
                                size="sm"
                                variant={
                                    direction === 'ltr' ? 'primary' : 'ghost'
                                }
                                aria-pressed={direction === 'ltr'}
                                onClick={() => setDirection('ltr')}
                            >
                                LTR
                            </Button>
                            <Button
                                size="sm"
                                variant={
                                    direction === 'rtl' ? 'primary' : 'ghost'
                                }
                                aria-pressed={direction === 'rtl'}
                                onClick={() => setDirection('rtl')}
                            >
                                RTL
                            </Button>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => setDrawerOpen(true)}
                        >
                            Open drawer
                        </Button>

                        <Button onClick={() => setModalOpen(true)}>
                            Open modal
                        </Button>
                    </div>
                </div>

                {lastAdded && (
                    <Alert
                        tone="success"
                        className="mt-6"
                        title="Added to cart"
                        action={
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setLastAdded(null)}
                            >
                                Dismiss
                            </Button>
                        }
                    >
                        {lastAdded} is now in your cart.
                    </Alert>
                )}
            </div>

            <div className="ds-container grid gap-10 py-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:py-14">
                <aside className="hidden lg:block">
                    <nav
                        aria-label="Design system sections"
                        className="sticky top-28"
                    >
                        <p className="text-eyebrow text-ink-subtle uppercase">
                            On this page
                        </p>

                        <ul className="mt-3 space-y-1">
                            {sectionLinks.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className="rounded-control text-small text-ink-muted hover:bg-surface-muted hover:text-ink block px-3 py-2 transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                <main className="min-w-0 space-y-12">
                    <Section
                        id="foundations"
                        eyebrow="Foundations"
                        title="Tokens that keep every screen consistent."
                        description="A warm off-white canvas, charcoal type, and an emerald accent carry the interface. Everything else is spacing, line, and type."
                    >
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {palette.map((color) => (
                                <div
                                    key={color.name}
                                    className="rounded-card border-line bg-surface overflow-hidden border"
                                >
                                    <div
                                        className={cn(
                                            'border-line h-16 border-b',
                                            color.className,
                                        )}
                                    />
                                    <div className="p-3">
                                        <p className="text-small text-ink font-medium">
                                            {color.name}
                                        </p>
                                        <p className="text-caption text-ink-subtle mt-0.5">
                                            {color.token}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 grid gap-5 lg:grid-cols-2">
                            <Panel>
                                <Subheading>Type scale</Subheading>

                                <div className="space-y-4">
                                    <p className="text-display text-ink">
                                        Made to last.
                                    </p>
                                    <p className="text-h1 text-ink">
                                        Headline one
                                    </p>
                                    <p className="text-h2 text-ink">
                                        Headline two
                                    </p>
                                    <p className="text-h3 text-ink">
                                        Headline three
                                    </p>
                                    <p className="text-body text-ink-muted">
                                        Body copy stays readable at a
                                        comfortable measure. Product details
                                        should feel effortless to scan.
                                    </p>
                                    <p className="text-small text-ink-muted">
                                        Small copy for metadata, helper text,
                                        and interface labels.
                                    </p>
                                    <p className="text-eyebrow text-brand uppercase">
                                        Eyebrow label
                                    </p>
                                </div>
                            </Panel>

                            <div className="space-y-5">
                                <Panel>
                                    <Subheading>Radii & elevation</Subheading>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-control border-line bg-surface-muted border p-4">
                                            <span className="text-caption text-ink-muted">
                                                rounded-control
                                            </span>
                                        </div>
                                        <div className="rounded-card border-line bg-surface-muted border p-4">
                                            <span className="text-caption text-ink-muted">
                                                rounded-card
                                            </span>
                                        </div>
                                        <div className="rounded-panel border-line bg-surface-muted border p-4">
                                            <span className="text-caption text-ink-muted">
                                                rounded-panel
                                            </span>
                                        </div>
                                        <div className="rounded-card border-line bg-surface shadow-card border p-4">
                                            <span className="text-caption text-ink-muted">
                                                shadow-card
                                            </span>
                                        </div>
                                    </div>
                                </Panel>

                                <Panel>
                                    <Subheading>Spacing rhythm</Subheading>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-brand-soft h-2 w-4 rounded-full" />
                                            <span className="text-caption text-ink-muted">
                                                4px
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="bg-brand-soft h-2 w-8 rounded-full" />
                                            <span className="text-caption text-ink-muted">
                                                8px
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="bg-brand-soft h-2 w-16 rounded-full" />
                                            <span className="text-caption text-ink-muted">
                                                16px
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="bg-brand-soft h-2 w-24 rounded-full" />
                                            <span className="text-caption text-ink-muted">
                                                24px
                                            </span>
                                        </div>
                                    </div>
                                </Panel>
                            </div>
                        </div>
                    </Section>

                    <Section
                        id="atoms"
                        eyebrow="Atoms"
                        title="Small pieces, sharp edges."
                        description="Buttons, badges, avatars, icons, pricing, and availability indicators."
                    >
                        <div className="grid gap-5 lg:grid-cols-2">
                            <Panel>
                                <Subheading>Buttons</Subheading>

                                <div className="flex flex-wrap items-center gap-3">
                                    <Button>Primary</Button>
                                    <Button variant="secondary">
                                        Secondary
                                    </Button>
                                    <Button variant="outline">Outline</Button>
                                    <Button variant="ghost">Ghost</Button>
                                    <Button variant="danger">Danger</Button>
                                </div>

                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <Button size="sm">Small</Button>
                                    <Button size="md">Medium</Button>
                                    <Button size="lg">Large</Button>
                                    <Button loading>Loading</Button>
                                    <Button disabled>Disabled</Button>
                                    <Button variant="link">Link button</Button>
                                </div>
                            </Panel>

                            <Panel>
                                <Subheading>Badges</Subheading>

                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge>Neutral</Badge>
                                    <Badge variant="brand">Brand</Badge>
                                    <Badge variant="success" dot>
                                        In stock
                                    </Badge>
                                    <Badge variant="warning" dot>
                                        Low stock
                                    </Badge>
                                    <Badge variant="danger" dot>
                                        Out of stock
                                    </Badge>
                                    <Badge variant="sale">-20%</Badge>
                                    <Badge variant="outline">Outline</Badge>
                                </div>

                                <div className="mt-5">
                                    <Subheading>Avatars</Subheading>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <Avatar
                                        name="Amina Yusuf"
                                        size="xs"
                                        status="online"
                                    />
                                    <Avatar
                                        name="Noah Williams"
                                        size="sm"
                                        status="offline"
                                    />
                                    <Avatar name="Kiln Studio" size="md" />
                                    <Avatar
                                        name="Field Notes"
                                        size="lg"
                                        status="online"
                                    />
                                    <Avatar name="Atelier North" size="xl" />
                                </div>
                            </Panel>
                        </div>

                        <Panel className="mt-5">
                            <Subheading>Icons</Subheading>

                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-10">
                                {iconNames.map((name) => (
                                    <div
                                        key={name}
                                        className="rounded-control border-line bg-surface-muted/50 flex flex-col items-center gap-2 border px-2 py-3"
                                    >
                                        <Icon name={name} size="md" />
                                        <span className="text-ink-subtle w-full truncate text-center text-[0.625rem]">
                                            {name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Panel>

                        <div className="mt-5 grid gap-5 sm:grid-cols-3">
                            <Panel>
                                <Subheading>Price</Subheading>
                                <Price
                                    amount={48}
                                    compareAtPrice={60}
                                    size="lg"
                                />
                            </Panel>

                            <Panel>
                                <Subheading>Rating</Subheading>
                                <Rating
                                    value={4.6}
                                    count={128}
                                    showValue
                                    size="md"
                                />
                            </Panel>

                            <Panel>
                                <Subheading>Availability</Subheading>
                                <div className="space-y-2">
                                    <StockStatus status="in-stock" />
                                    <StockStatus status="low-stock" />
                                    <StockStatus status="out-of-stock" />
                                    <StockStatus status="backorder" />
                                </div>
                            </Panel>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-6">
                            <TextLink href="#forms" showIcon>
                                Jump to forms
                            </TextLink>
                            <TextLink
                                href="https://laravel.com"
                                external
                                showIcon
                            >
                                External link
                            </TextLink>
                        </div>
                    </Section>

                    <Section
                        id="forms"
                        eyebrow="Forms"
                        title="Clear inputs, honest errors."
                        description="Every field has a label, a visible focus state, and room for helper text or validation."
                    >
                        <div className="grid gap-5 lg:grid-cols-2">
                            <Panel>
                                <Subheading>Text fields</Subheading>

                                <div className="space-y-4">
                                    <Input
                                        label="Full name"
                                        placeholder="Amina Yusuf"
                                        hint="Use the name shown on your account."
                                    />

                                    <Input
                                        label="Email address"
                                        type="email"
                                        defaultValue="amina@"
                                        startIcon="user"
                                        error="Enter a valid email address."
                                    />

                                    <Input
                                        label="Search"
                                        startIcon="search"
                                        placeholder="Search products"
                                    />

                                    <Input
                                        label="Disabled field"
                                        defaultValue="Not editable"
                                        disabled
                                    />
                                </div>
                            </Panel>

                            <Panel>
                                <Subheading>Selection & toggles</Subheading>

                                <div className="space-y-4">
                                    <Textarea
                                        label="Product description"
                                        placeholder="Describe materials, care, and sizing."
                                        hint="Keep it specific and useful."
                                    />

                                    <Select
                                        label="Category"
                                        value={category}
                                        onChange={(event) =>
                                            setCategory(event.target.value)
                                        }
                                    >
                                        <option value="all">
                                            All categories
                                        </option>
                                        <option value="home">Home</option>
                                        <option value="apparel">Apparel</option>
                                        <option value="accessories">
                                            Accessories
                                        </option>
                                    </Select>

                                    <Checkbox
                                        label="Email me about new arrivals"
                                        description="A short note when something worth seeing lands."
                                        checked={agree}
                                        onChange={(event) =>
                                            setAgree(event.target.checked)
                                        }
                                    />

                                    <div className="space-y-2">
                                        <Radio
                                            name="contact-method"
                                            value="email"
                                            label="Contact me by email"
                                            checked={contactMethod === 'email'}
                                            onChange={() =>
                                                setContactMethod('email')
                                            }
                                        />
                                        <Radio
                                            name="contact-method"
                                            value="sms"
                                            label="Contact me by SMS"
                                            checked={contactMethod === 'sms'}
                                            onChange={() =>
                                                setContactMethod('sms')
                                            }
                                        />
                                    </div>

                                    <Switch
                                        label="Order updates"
                                        description="Receive a notification when your order ships."
                                        checked={notifications}
                                        onCheckedChange={setNotifications}
                                    />
                                </div>
                            </Panel>
                        </div>

                        <Panel className="mt-5">
                            <Subheading>Search & quantity</Subheading>

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                <SearchField
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    onSubmit={handleSearch}
                                    className="flex-1"
                                />

                                <QuantityStepper
                                    value={quantity}
                                    onChange={setQuantity}
                                />
                            </div>

                            {submittedSearch && (
                                <p className="text-caption text-ink-muted mt-3">
                                    Last submitted search: “{submittedSearch}”
                                </p>
                            )}
                        </Panel>
                    </Section>

                    <Section
                        id="feedback"
                        eyebrow="Feedback"
                        title="Tell people what is happening."
                        description="Alerts, loading states, skeletons, and empty states that stay calm under pressure."
                    >
                        <div className="space-y-3">
                            <Alert tone="info" title="Delivery update">
                                Orders placed before 2pm ship the same day.
                            </Alert>

                            <Alert tone="warning" title="Low stock">
                                Only three left in this size.
                            </Alert>

                            <Alert tone="danger" title="Payment failed">
                                Check your card details and try again.
                            </Alert>

                            {alertVisible ? (
                                <Alert
                                    tone="success"
                                    title="Saved"
                                    onDismiss={() => setAlertVisible(false)}
                                >
                                    Your changes are live.
                                </Alert>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAlertVisible(true)}
                                >
                                    Restore dismissible alert
                                </Button>
                            )}
                        </div>

                        <div className="mt-5 grid gap-5 lg:grid-cols-2">
                            <Panel>
                                <Subheading>Spinners</Subheading>

                                <div className="flex items-center gap-6">
                                    <Spinner size="sm" label="Loading small" />
                                    <Spinner size="md" label="Loading medium" />
                                    <Spinner size="lg" label="Loading large" />
                                </div>
                            </Panel>

                            <Panel>
                                <Subheading>Skeletons</Subheading>

                                <div className="space-y-3">
                                    <Skeleton
                                        variant="text"
                                        className="w-3/4"
                                    />
                                    <Skeleton
                                        variant="text"
                                        className="w-1/2"
                                    />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            </Panel>
                        </div>

                        <EmptyState
                            className="mt-5"
                            icon="search"
                            title="No products match those filters"
                            description="Clear a filter or try a broader search. The right thing is probably one adjustment away."
                            action={
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSubmittedSearch('');
                                        setCategory('all');
                                    }}
                                >
                                    Clear filters
                                </Button>
                            }
                        />
                    </Section>

                    <Section
                        id="navigation"
                        eyebrow="Navigation"
                        title="Orientation without noise."
                        description="Breadcrumbs, tabs, pagination, and overlay patterns for moving through dense screens."
                    >
                        <Panel>
                            <Subheading>Breadcrumbs</Subheading>

                            <Breadcrumbs
                                items={[
                                    { label: 'Home', href: '/' },
                                    {
                                        label: 'Home & living',
                                        href: '/categories',
                                    },
                                    { label: 'Stoneware Pour-Over Set' },
                                ]}
                            />
                        </Panel>

                        <Panel className="mt-5">
                            <Subheading>Tabs</Subheading>

                            <Tabs
                                value={tab}
                                onValueChange={setTab}
                                items={[
                                    {
                                        id: 'overview',
                                        label: 'Overview',
                                        content: (
                                            <p className="text-small text-ink-muted">
                                                The overview tab can hold
                                                product details, materials, and
                                                care instructions.
                                            </p>
                                        ),
                                    },
                                    {
                                        id: 'reviews',
                                        label: 'Reviews',
                                        count: 128,
                                        content: (
                                            <div className="space-y-3">
                                                <Rating
                                                    value={4.6}
                                                    count={128}
                                                    showValue
                                                    size="md"
                                                />
                                                <p className="text-small text-ink-muted">
                                                    Reviews can use the same
                                                    rating atom and product card
                                                    patterns.
                                                </p>
                                            </div>
                                        ),
                                    },
                                    {
                                        id: 'shipping',
                                        label: 'Shipping',
                                        content: (
                                            <p className="text-small text-ink-muted">
                                                Shipping and returns detail
                                                lives here, close to the
                                                purchase decision.
                                            </p>
                                        ),
                                    },
                                ]}
                            />
                        </Panel>

                        <Panel className="mt-5">
                            <Subheading>Pagination</Subheading>

                            <Pagination
                                currentPage={page}
                                totalPages={12}
                                onPageChange={setPage}
                            />

                            <p className="text-caption text-ink-muted mt-3">
                                Current page: {page}
                            </p>
                        </Panel>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setDrawerOpen(true)}
                            >
                                Open filter drawer
                            </Button>
                            <Button onClick={() => setModalOpen(true)}>
                                Open confirmation modal
                            </Button>
                        </div>
                    </Section>

                    <Section
                        id="products"
                        eyebrow="Products"
                        title="Cards built for the decision."
                        description="Price, rating, availability, seller, and a single clear action. Grid and list layouts share the same data contract."
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div
                                role="group"
                                aria-label="Product layout"
                                className="rounded-control border-line bg-surface inline-flex border p-1"
                            >
                                <Button
                                    size="sm"
                                    variant={
                                        productLayout === 'grid'
                                            ? 'primary'
                                            : 'ghost'
                                    }
                                    aria-pressed={productLayout === 'grid'}
                                    onClick={() => setProductLayout('grid')}
                                >
                                    Grid
                                </Button>
                                <Button
                                    size="sm"
                                    variant={
                                        productLayout === 'list'
                                            ? 'primary'
                                            : 'ghost'
                                    }
                                    aria-pressed={productLayout === 'list'}
                                    onClick={() => setProductLayout('list')}
                                >
                                    List
                                </Button>
                            </div>

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    setLoadingProducts((current) => !current)
                                }
                            >
                                {loadingProducts
                                    ? 'Show products'
                                    : 'Show loading state'}
                            </Button>
                        </div>

                        <ProductGrid
                            className="mt-5"
                            products={visibleProducts}
                            layout={productLayout}
                            loading={loadingProducts}
                            skeletonCount={productLayout === 'grid' ? 8 : 3}
                            onAddToCart={handleAddToCart}
                            onToggleWishlist={handleToggleWishlist}
                            wishlistedIds={wishlistedIds}
                            emptyTitle="No products in this edit"
                            emptyDescription="Search across the marketplace or clear your filters to see more."
                        />
                    </Section>

                    <Section
                        id="dashboard"
                        eyebrow="Dashboard"
                        title="Operational patterns for sellers."
                        description="Stat cards and section headings keep numbers legible without turning the workspace into a spreadsheet."
                    >
                        <SectionHeading
                            eyebrow="Last 30 days"
                            title="Seller overview"
                            description="A quick read on revenue, orders, and catalog health."
                            action={
                                <Button variant="outline" size="sm">
                                    Export report
                                </Button>
                            }
                        />

                        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <StatCard
                                label="Revenue"
                                value="$24,860"
                                helper="+12.4% vs last month"
                                trend="up"
                                icon="credit-card"
                            />
                            <StatCard
                                label="Orders"
                                value="184"
                                helper="+8.1% vs last month"
                                trend="up"
                                icon="package"
                            />
                            <StatCard
                                label="Conversion"
                                value="3.8%"
                                helper="-0.4% vs last month"
                                trend="down"
                                icon="sparkles"
                            />
                            <StatCard
                                label="Low stock"
                                value="7"
                                helper="Needs attention"
                                trend="neutral"
                                icon="alert-circle"
                            />
                        </div>
                    </Section>
                </main>
            </div>

            <SiteFooter />

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Publish this product?"
                description="Your listing will be visible in the marketplace immediately."
                footer={
                    <>
                        <Button
                            variant="ghost"
                            onClick={() => setModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={() => setModalOpen(false)}>
                            Publish product
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-small text-ink-muted">
                        Make sure the title, price, and stock level are correct.
                        You can edit the listing at any time.
                    </p>

                    <Input
                        label="Product name"
                        defaultValue="Everyday Canvas Tote"
                    />

                    <Checkbox
                        label="Notify followers when this goes live"
                        defaultChecked
                    />
                </div>
            </Modal>

            <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title="Filters"
                description="Narrow the catalog to exactly what you need."
                footer={
                    <Button fullWidth onClick={() => setDrawerOpen(false)}>
                        Show 24 results
                    </Button>
                }
            >
                <div className="space-y-5">
                    <Select
                        label="Category"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                    >
                        <option value="all">All categories</option>
                        <option value="home">Home</option>
                        <option value="apparel">Apparel</option>
                        <option value="accessories">Accessories</option>
                    </Select>

                    <Checkbox
                        label="In stock only"
                        description="Hide items that need a backorder."
                        defaultChecked
                    />

                    <Checkbox
                        label="On sale"
                        description="Only show discounted products."
                    />

                    <Switch
                        label="Free delivery"
                        description="Show items with free delivery."
                        checked={freeDelivery}
                        onCheckedChange={setFreeDelivery}
                    />
                </div>
            </Drawer>
        </div>
    );
}
