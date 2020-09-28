import React, { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import styles from './index.module.scss'
import {  useDispatch, connect } from 'react-redux'
import {receiveCartData,changeQuantity,deleteProduct,fetchUserCart} from '../../redux/actions/cart'
import {fillOrderData} from '../../redux/actions/order'

import axios from "axios";
import {Link,useHistory} from 'react-router-dom';

import GuestCart from './guestCart'

function Cart({cartData, products, isFetching,userInfo,fetchUserCart,deleteProduct,changeQuantity,fillOrderData,emptyCart}) {
    const dispatch = useDispatch()
    const history =useHistory()
    const [cant, setCant] = useState(1)
    const [idCarrito,setIdCarrito] = useState()

    //Productos locales para pasarle al carrito guest
    const localStorageCart = JSON.parse(localStorage.getItem('guestCart')) ||  { products: [] }


    const checkout= (orderId) =>{
        fillOrderData(cartData)

        axios.put(`http://localhost:3001/orders/${orderId}`,{
            state : "Creada"
        })
        .then(() => emptyCart() )
        .then(() => history.push('/order'))
        .catch(err => console.log('error al ir a checkout:', err))
    }
    

    const sumarCantidad = (e,product) =>{
        e.preventDefault()
        const newQuantity = product.LineaDeOrden.quantity+1
        changeQuantity(userInfo.user_id, product.product_id, newQuantity)
        setCant(newQuantity)
    }
    const restarCantidad = (e,product) =>{
        e.preventDefault();
        const newQuantity = product.LineaDeOrden.quantity - 1
        changeQuantity(userInfo.user_id, product.product_id, newQuantity)
        setCant(newQuantity)
    }

    const eliminarProducto = async (user_id, product_id) => {
        await deleteProduct(user_id, product_id)
        await fetchUserCart(userInfo.user_id)
    }
    
    useEffect( () => {
        fetchUserCart(userInfo.user_id)
    }, [userInfo,cant])
  
    //Si no hay usuario logeado, retorna carrito de guest que saca sus productos de localStorage, en vez del carrito normal
    if(userInfo.role === 'Guest') return <GuestCart products = {localStorageCart.products}/>
    return (
    <div className={`${styles.card} offset-1 col-md-10 col-12 mt-3 pt-4 pb-4`}>
            <h4 className='text-center pb-3'>Carrito de { userInfo.first_name } {userInfo.last_name} </h4>
            {products.length ? products.map( product =>                 
               <div key={product.product_id} className='d-flex mb-4'>
                    <div className="imagen col-md-2 text-center d-flex align-items-center justify-content-center">
                        <img src={product.images[0].img_url} style={{height: '60px'}}/>
                    </div>
                    <div className="descripcion col-md-5 d-flex flex-column">
                        <h4 className='font-weight-bold'>{product.name}</h4>
                        <h5 className={styles.description}>{ `${product.description.substr(0,100)}...`}</h5>
                    </div>
                    <div className="cantidad col-md-2 text-center" style={{padding:0}}>
                        <div className="col-md-12 mb-1">
                            <Form.Control type="text" value={product.LineaDeOrden.quantity} className='m-auto col-md-4 text-center' />
                        </div>
                        <div className="buttons">
                            <Button className={`${styles.masMenos}`} onClick={ e => product.LineaDeOrden.quantity > 1 && restarCantidad(e,product)}>-</Button>
                            <Button className={`${styles.masMenos}`} onClick={ e => sumarCantidad(e,product)} >+</Button>
                        </div>
                        <Form.Text className="text-muted">Stock: {product.stock} </Form.Text>
                    </div>

                    <div className="precio col-md-2 d-flex align-items-center justify-content-center ">
                        <h3 className={styles.price}>${product.price*product.LineaDeOrden.quantity}</h3>
                    </div>

                    <div className='eliminar col-md-1 d-flex justify-content-center align-items-center'>
                        <Button variant='danger' onClick={ () =>eliminarProducto(userInfo.user_id, product.product_id) }>
                        <svg width="2em" height="2em" viewBox="0 0 16 16" className="bi bi-trash" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg> 
                        </Button>
                    </div>    
                   
                </div> 
            ):<h3 style={{margin:'auto'}}>No hay productos en tu carrito, hace click <Link to='/products'>acá</Link> para continuar tu compra</h3>}

            {products.length ?
            <span style={{textAlign:'end',fontWeight:'bold',fontSize:'20px',marginBottom:'10px',marginRight:'20px'}}>Precio total: ${products.reduce((acc, p) => acc + (p.LineaDeOrden.price * p.LineaDeOrden.quantity), 0)}</span>
             : null}
             
            <span  className={`d-flex justify-content-end`} >
                <Button className="btn btn-warning font-weight-bold" style={{width:'15%'}} onClick={() => checkout(cartData.order_id)} >SIGUIENTE</Button>            
            </span>
            
        </div>
    )
}

const mapStateToProps = state => {
    return {
        isFetching: state.cart.isFetching,
        cartData: state.cart.cartData,
        products: state.cart.cartData.products || [],
        userInfo : state.auth.user
    }
}
  
const mapDispatchToProps = (dispatch, props) => {
    const emptyCartData =  {
            products : []
        }    
    return {
        deleteProduct: (userId, product_id) => dispatch(deleteProduct(userId, product_id)),
        fetchUserCart: (userId) => dispatch(fetchUserCart(userId)),
        changeQuantity: (userId, product_id, quantity) => dispatch(changeQuantity(userId, product_id, quantity)),
        fillOrderData: (data) => dispatch(fillOrderData(data)),
        emptyCart : () => dispatch(receiveCartData(emptyCartData))
    }
}
    
export default connect(mapStateToProps, mapDispatchToProps)(Cart)