import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  title?: string;
  subtitle?: string;
}

export function Breadcrumb({ items, title, subtitle }: BreadcrumbProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="hover:text-indigo-600 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
            {index < items.length - 1 && <span>/</span>}
          </div>
        ))}
      </div>
      {title && (
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
      )}
      {subtitle && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
