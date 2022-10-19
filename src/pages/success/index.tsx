import {ImageContainer, SuccessContainer } from "../../styles/pages/success";

import Link from "next/link";
import {GetServerSideProps} from "next";
import {stripe} from "../../lib/tripe";
import {Stripe} from "stripe";
import Image from "next/image";

interface SuccessProps {
    customerName: string;
    product: {
        name: string;
        imageUrl: string;
    }
}

export default function Success({ customerName, product } : SuccessProps) {
    return (
        <SuccessContainer>
            <h1>Compra efetuada</h1>
            <ImageContainer>
                <Image src={product.imageUrl} width={120} height={110} />
            </ImageContainer>
            
            <p>
                Obrigado por comprar conosco <strong>{ customerName }</strong>
                Product name: <strong>{ product.name }</strong>
            </p>
            
            <Link href="/" >
                Go Back
            </Link>
        </SuccessContainer>
    )
}
    
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    const sessionId = query.session_id as string
    
    if (! sessionId) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }
    
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items', 'line_items.data.price.product']
    })
    
    const customerName = session.customer_details.name
    const product = session.line_items[0].price.product as Stripe.Product
    
    return {
        props: {
            customerName: customerName,
            product: {
                name: product.name,
                imageUrl: product.images[0],
            }
        }
    }
}