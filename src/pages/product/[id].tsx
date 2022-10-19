import { ProductContainer, ImageContainer, ProductDetails } from "../../styles/pages/product";
import {GetStaticPaths, GetStaticProps} from "next";
import {stripe} from "../../lib/tripe";
import Stripe from "stripe";
import Image from "next/image";
import {useRouter} from "next/router";
import axios from "axios";
import {useState} from "react";

interface ProductProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: string; 
    defaultPriceId: string; 
    description: string;
  }
}

export default function Product({ product }: ProductProps) {
    const { isFallback } = useRouter()
    const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false)
    
    async function handleBuyProduct() {
        try {
        setIsCreatingCheckoutSession(true)
            const response = await axios.post('/api/checkout', {
                priceId: product.defaultPriceId
            })
            const { checkoutUrl } = response.data
            
            window.location.href = checkoutUrl
        } catch (err) {
            console.error(err)
        } finally {
            setIsCreatingCheckoutSession(false)
        }
    }
    
    if (isFallback) {
      return <p>Loading...</p>
    }
    
    return (
        <ProductContainer>
            <ImageContainer>
                <Image src={product.imageUrl} width={520} height={400} alt="" />
            </ImageContainer>
            <ProductDetails>
                <h1>{ product.name }</h1>
                <span>{ product.price }</span>
                
                <p>{ product.description }</p>
                
                <button disabled={isCreatingCheckoutSession} onClick={handleBuyProduct} >
                    Buy Now
                </button>
            </ProductDetails>
        </ProductContainer>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
        { params: { id: 'prod_MdH1rAC8WRsRpB' } }
    ],
    fallback: true
  }
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {
    const productId = params.id
    
    const product = await stripe.products.retrieve(productId, {
        expand: ['default_price'],
    })
    const price = product.default_price as Stripe.Price
    const formattedPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL' 
      }
    ).format(price.unit_amount / 100)

    return {
        props: {
          product: {
            id: product.id,
            name: product.name,
            imageUrl: product.images.pop(),
            price: formattedPrice,
            defaultPriceId: price.id,
            description: product.description
          }
        },
        revalidate: 60 * 60 //1 hour
    }
}