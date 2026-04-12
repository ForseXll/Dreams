'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AddToCart from './AddToCart';
import DeleteItem from './DeleteItem';
import type { Item as ItemType } from '../lib/api/types';
import formatMoney from '../lib/formatMoney';
import { cardVariants, buttonVariants, cn } from '../lib/ui';
import { typographyClasses } from '../lib/ui';

interface ItemProps {
  item: ItemType;
  index?: number;
}

export default function Item({ item, index = 0 }: ItemProps) {
  const itemLink = { pathname: '/item', query: { id: item.id } };

  return (
    <motion.article 
      className={cn(
        cardVariants({ variant: "interactive" }),
        "group relative flex h-full flex-col overflow-hidden"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1]
      }}
      whileHover={{ y: -4 }}
    >
      {/* Image Container - clickable */}
      <Link href={itemLink} className="block">
        {item.image ? (
          <div className="relative h-[300px] w-full overflow-hidden">
            <Image
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-text)]/70 via-transparent to-transparent" />
            {/* Price badge overlaid on image */}
            <span className="absolute bottom-3 left-3 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-[1.3rem] font-bold text-[var(--color-primary-foreground)] shadow-lg">
              {formatMoney(item.price)}
            </span>
          </div>
        ) : (
          <div className="relative flex h-[300px] w-full items-center justify-center bg-[var(--color-surface-alt)]">
            <div className="text-center text-[var(--color-text-muted)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              <p className={cn(typographyClasses.small, typographyClasses.muted)}>No image</p>
            </div>
            {/* Price badge for no-image items */}
            <span className="absolute bottom-3 left-3 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-[1.3rem] font-bold text-[var(--color-primary-foreground)] shadow-lg">
              {formatMoney(item.price)}
            </span>
          </div>
        )}
      </Link>
      
      {/* Content */}
      <div className="flex flex-1 flex-col px-6 pt-5 pb-5">
        <h3 className={cn(typographyClasses.h3, "text-left")}>
          <Link 
            className="transition-colors hover:text-[var(--color-text-muted)] line-clamp-2" 
            href={itemLink}
          >
            {item.title}
          </Link>
        </h3>
        
        <p className={cn(
          typographyClasses.body,
          typographyClasses.muted,
          "mt-2 flex-grow text-left line-clamp-2"
        )}>
          {item.description}
        </p>
      </div>

      {/* Actions */}
      <div className="grid w-full grid-cols-1 gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface-alt)]/30 px-5 py-4 backdrop-blur-sm sm:grid-cols-3">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex">
          <Link
            className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
            href={{ pathname: '/update', query: { id: item.id } }}
          >
            Edit
          </Link>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex">
          <DeleteItem
            className={cn(buttonVariants({ variant: "destructive" }), "w-full")}
            id={item.id}
          >
            Delete
          </DeleteItem>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex">
          <AddToCart
            className={cn(buttonVariants({ variant: "primary" }), "w-full")}
            id={item.id}
          >
            Add to Cart
          </AddToCart>
        </motion.div>
      </div>
    </motion.article>
  );
}