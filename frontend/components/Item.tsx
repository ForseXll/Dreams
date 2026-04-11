'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AddToCart from './AddToCart';
import DeleteItem from './DeleteItem';
import type { Item as ItemType } from '../lib/api/types';
import formatMoney from '../lib/formatMoney';
import { cardVariants, buttonVariants, badgeVariants, cn } from '../lib/ui';
import { typographyClasses } from '../lib/ui';

interface ItemProps {
  item: ItemType;
  index?: number;
}

export default function Item({ item, index = 0 }: ItemProps) {
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
      {/* Image Container */}
      {item.image ? (
        <div className="relative h-[300px] w-full overflow-hidden border-b border-[var(--color-border)]">
          <motion.div
            className="absolute inset-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              className="object-cover"
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>
          
          {/* Hover Overlay */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-[var(--color-text)]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        </div>
      ) : null}
      
      {/* Content */}
      <div className="flex flex-1 flex-col px-6 pt-6 pb-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className={cn(
            typographyClasses.h3,
            "min-h-[5.8rem] max-w-[75%] text-left"
          )}>
            <Link 
              className="transition-colors hover:text-[var(--color-text-muted)] line-clamp-2" 
              href={{ pathname: '/item', query: { id: item.id } }}
            >
              {item.title}
            </Link>
          </h3>
          
          <span className={badgeVariants({ variant: "accent" })}>
            {formatMoney(item.price)}
          </span>
        </div>
        
        <p className={cn(
          typographyClasses.body,
          typographyClasses.muted,
          "flex-grow text-left line-clamp-3"
        )}>
          {item.description}
        </p>
      </div>

      {/* Actions */}
      <div className="grid w-full grid-cols-1 gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface-alt)]/30 px-5 py-4 backdrop-blur-sm sm:grid-cols-3">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            className={buttonVariants({ variant: "secondary" })}
            href={{ pathname: '/update', query: { id: item.id } }}
          >
            Edit
          </Link>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <DeleteItem
            className={buttonVariants({ variant: "destructive" })}
            id={item.id}
          >
            Delete
          </DeleteItem>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <AddToCart
            className={buttonVariants({ variant: "primary" })}
            id={item.id}
          >
            Add to Cart
          </AddToCart>
        </motion.div>
      </div>
    </motion.article>
  );
}
