import Link from 'next/link';
import AddToCart from './AddToCart';
import DeleteItem from './DeleteItem';
import ItemStyles from './styles/ItemStyles';
import PriceTag from './styles/PriceTag';
import Title from './styles/Title';
import type { Item as ItemType } from '../lib/api/types';
import formatMoney from '../lib/formatMoney';

interface ItemProps {
  item: ItemType;
}

export default function Item({ item }: ItemProps) {
  return (
    <ItemStyles>
      {item.image ? <img src={item.image} alt={item.title} /> : null}
      <Title>
        <Link href={{ pathname: '/item', query: { id: item.id } }}>{item.title}</Link>
      </Title>
      <PriceTag>{formatMoney(item.price)}</PriceTag>
      <p>{item.description}</p>

      <div className="buttonList">
        <Link href={{ pathname: '/update', query: { id: item.id } }}>Edit</Link>
        <DeleteItem id={item.id}>Delete this Item</DeleteItem>
        <AddToCart id={item.id}>Add to Cart</AddToCart>
      </div>
    </ItemStyles>
  );
}
