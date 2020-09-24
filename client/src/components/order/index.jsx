import React, {useEffect, useState} from 'react'
import styles from './orderStyle.module.css'
import { useDispatch, connect } from 'react-redux'
import axios from "axios"
import { useHistory } from 'react-router-dom';



function Order({orderData,userInfo}) {
    const dispatch = useDispatch()
    const history = useHistory()
    const [promoCode,setpromoCode] = useState('')

    const [hasDiscount,setHasDiscount] = useState(false)
   
    const {products} = orderData

    const [form,setForm] = useState({
      firstName:'',
      lastName:'',
      email:'',
      address:'',
      depto:'',
      discount:false
    })

    

    const updateField = async e => {
      const { id, value } = e.target

      await setForm({ 
          ...form,
          [id]: value
      })
  }



    const funcionSuma = (products) => {
      var total = 0
      products.map(product => {
        total += (product.LineaDeOrden.price * product.LineaDeOrden.quantity)
      })

      return total
    }

    


    /////////////ESTA FUNCION ESTA BIEN

    function handleSubmit(e) {
      e.preventDefault()
      
      axios.post('http://localhost:3001/orders/finished',{
        email: form.email,
        
        order_id:orderData.order_id,

        firstName:form.firstName,
        lastName: form.lastName,
        address: form.address,
        depto: form.depto,
        phone: form.phone,
        products: products,
        discount:form.discount

      }).then((res)=>console.log('oka'))


      axios.put(`http://localhost:3001/orders/${orderData.order_id}`,{
        state : "Completa"
      }).then(() => history.push("/"))

    }

    const checkDiscount = (e)=>{
      e.preventDefault()
      form.discount= true
      if(promoCode  == "SOYHENRY"){
        setHasDiscount(true)
      } 
    }

    const ApplyDiscount = (products)=>{
      return (funcionSuma(products) * 0.8).toFixed(2)
    }

    useEffect(()=>{

    },[hasDiscount])

    return ( 
        <div className={styles.containerOrder}>
            <div className="py-5 text-center">
                 <h2>Ya casi estamos!</h2>
                <p className="lead">Completa tus datos para terminar con la compra</p>
            </div>
            <div className="row">
                <div className="col-md-4 order-md-2 mb-4">
                    <h4 className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-muted">Tu id de orden es:{orderData.order_id} </span>
                        <span className="text-muted">Tus productos</span>
                        <span className="badge badge-secondary badge-warning">{products.length} </span>
                    </h4>

                    <ul className="list-group mb-3">
                        {products.length && products.map(product => 
                            <li className="list-group-item d-flex justify-content-between lh-condensed">
                              <div>
                                <h6 className="my-0">{product.name}</h6>
                                
                              </div>
                              <span className="text-muted">${product.LineaDeOrden.price} x {product.LineaDeOrden.quantity} </span>
                            </li>
                        )}
                        
                        


                        <li className="list-group-item d-flex justify-content-between">
                          <span>Total (pesos)</span>
                          <strong>$ {
                            hasDiscount == false?funcionSuma(products):ApplyDiscount(products)
                         } </strong>
                        </li>
                    </ul>
                     <form className={`card p-2 ${styles.promoCode}`}>
                        <div className="input-group">

                          <input type="text" onChange={(e)=>{setpromoCode(e.target.value)}} className="form-control" placeholder="Promo code"/>

                          <div className="input-group-append">
                            <button onClick={checkDiscount} className="btn btn-secondary">Aplicar promo</button>
                          </div>
                        </div>
                      </form>
                </div>
                <div className="col-md-8 order-md-1">

                <h4 className="mb-3">Información de facturación</h4>

      <form className="needs-validation" onSubmit={handleSubmit} >
        <div className="row">
          <div className="col-md-6 mb-3">
            <label for="firstName">Nombre</label>
            <input onChange={updateField} type="text" value={form.firstName} className="form-control" id="firstName" placeholder="Ingresa tu nombre"  required />
            <div className="invalid-feedback">
              Ingresa tu nombre.
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <label for="lastName">Apellido</label>
            <input onChange={updateField} type="text" value={form.lastName} className="form-control" id="lastName" placeholder="Ingresa tu apellido" required/>
            <div className="invalid-feedback">
              Tu apellido es necesario.
            </div>
          </div>
        </div>

        

        <div className="mb-3">
          <label for="email">Email </label>
          <input onChange={updateField} type="email" value={form.email} className="form-control" id="email" placeholder="herny@gmail.com"/>
          <div className="invalid-feedback">
            Ingresa una dirección de email válida.
          </div>
        </div>

        <div className="mb-3">
          <label for="phone">Teléfono </label>
          <input onChange={updateField} type="number" value={form.phone} className="form-control" id="phone" placeholder="1161113411"/>
          <div className="invalid-feedback">
            Ingrese un teléfono válido
          </div>
        </div>

        <div className="mb-3">
          <label for="address">Dirección</label>
          <input onChange={updateField} type="text" value={form.direccion} className="form-control" id="address" placeholder="Av. Luis Maria Campos 1053" required/>
          <div className="invalid-feedback">
            Por favor ingresa una direción válida.
          </div>
        </div>

        <div className="mb-3">
            <label for="Piso">Piso/Departamento</label>
            <input onChange={updateField} type="text" className="form-control" id="depto" placeholder="5/H" />
        </div>

        <button onClick={()=>console.log(form)}/>

        <h4 className="mb-3">Forma de Pago</h4>

        <div className="d-block my-3">
          <div className="custom-control custom-box">
            <input id="credit" name="paymentMethod" type="radio" className="custom-control-input" required/>
            <label className="custom-control-label" for="credit">Tarjeta de crédito</label>
          </div>
          <div className="custom-control custom-box">
            <input id="debit" name="paymentMethod" type="radio" className="custom-control-input" required/>
            <label className="custom-control-label" for="debit">Tarjeta de débito</label>
          </div>
          <div className="custom-control custom-box">
            <input id="paypal" name="paymentMethod" type="radio" className="custom-control-input" required/>
            <label className="custom-control-label" for="paypal">PayPal</label>
          </div>
          <div className="custom-control custom-box">
            <input id="efectivo" name="paymentMethod" type="radio" className="custom-control-input" required/>
            <label className="custom-control-label" for="efectivo">Efectivo en la entrega</label>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label for="cc-name">Nombre en la Tarjeta</label>
            <input type="text" className="form-control" id="cc-name" placeholder="" required/>
            <small className="text-muted">Tu nombre como figura en la Tarjeta</small>
            <div className="invalid-feedback">
              Completa tu nombre.
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <label for="cc-number">Numero de Tarjeta</label>
            <input type="text" className="form-control" id="cc-number" placeholder="" required/>
            <div className="invalid-feedback">
              Importante!
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-3 mb-3">
            <label for="cc-expiration">Fecha de expiración (MM/AA)  </label>
            <input type="text" className="form-control" id="cc-expiration" placeholder="" required/>
            <div className="invalid-feedback">
              Fecha de expiración requerida.
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <label for="cc-cvv">CVV</label>
            <input type="text" className="form-control" id="cc-cvv" placeholder="" required/>
            <div className="invalid-feedback">
              Código de seguridad requerido.
            </div>
          </div>
        </div>
        <hr className="mb-4"/>
        <button className="btn btn-warning btn-lg btn-block" type="submit">Finalizar compra</button>
      </form> 
      </div></div>
       </div>
     
        )
       

}


const mapStateToProps = state => {
    return {
        userInfo : state.auth.user,
        orderData: state.order.orderData
    }
}
  
const mapDispatchToProps = (dispatch, props) => {
    return {
        //fetchProducts: () => dispatch(fetchProducts()),
        //loadUserData: () =>dispatch(loadUserData())
    }
}
    
export default connect(mapStateToProps, mapDispatchToProps)(Order)