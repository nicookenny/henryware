import React, { useState, useEffect } from 'react'
import { Button, Modal, Form } from 'react-bootstrap';
import { TextField } from '@material-ui/core';
import Select from 'react-select'
import {useHistory} from 'react-router-dom';
import axios from 'axios';
import { FaArrowCircleLeft,FaArrowCircleRight } from 'react-icons/fa';
import FormControl from '@material-ui/core/FormControl';
import Selectt from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import style from './Crud.module.css';


//Redux
import {connect} from 'react-redux'
import { search, selectCategory, changePage, selectAll, getProducts } from '../../redux/actions/crud';


const Crud =(props)=> {
    //Autenticación
    const {user, isFetching} = props
    const history = useHistory()
    if(isFetching === false && user.role !== "admin"){
         history.push("/404")
    }

    //Filtrado y búsqueda usando redux:
        //States
        const { products, view, searchInput, selectedCategory, currentPage } = props;

        //Acciones
        const { search, selectCategory, changePage, selectAll, getProducts } = props;

        const retrocederPagina = () => {
            changePage(currentPage - 1);
        };
        const avanzarPagina = () => {
            changePage(currentPage + 1);
        };
    

    
    //Estado local de categorías
    const [categories, setCategories] = useState([]);

    //Estado local de products
    // const [products, setProducts] = useState([]);

    //show muestra el modal para agregar/editar si esta en TRUE
    const [ show, setShow ] = useState(false);

    //addEdit lo utilizamos para setear el método POST o PUT en el fetch que agrega o edita
    const [ addEdit, setAddEdit ] = useState()

    //state para editar un registro / agregar imágenes a un producto
    const [ idUpdate, setIdUpdate ] = useState()

    //state para id de categoria
    const [ idCategoria, setIdCategoria ] = useState()

    //state para id de producto
    //const [ idProducto, setIdProducto ] = useState()
    
    //form es un objeto que toma todos los valores del formulario
    const [ form, setForm ] = useState({
        name: '',
        description: '',
        warranty: '',
        price:'',
        stock:'',
        image:'',
        rating:null,
    });

    //Estado para mostrar/esconder el modal de eliminar producto
    const [showModalEliminar, setShowModalEliminar] = useState(false);

    //Trae todas las categorías de la base de datos y setea el estado categories
    const getCategories = async ()=>{
        try {
            const response = await fetch(`http://localhost:3001/products/categories`);
            const jsonData = await response.json();
            setCategories(jsonData)
        } catch (error) {
            console.error(error.message)
        }
      }

    //actualiza el state de form segun van cambiando los inputs
    const updateField = async e => {
        const {name, value} = e.target
       // console.log(name, value)
        await setForm({
            ...form,
            [name]: value
        })
    }

    //Modal de botón de eliminar producto
    const handleCloseElim = () => setShowModalEliminar(false);
    const handleShowElim = () => setShowModalEliminar(true);
    const [ idEliminar, setIdEliminar ] = useState(null);

    //handleClose cierra la ventana modal
    const handleClose = () => setShow(false);

    //handleAddUpdate muestra la ventana modal y además actualiza el state de addEdit para hacer el fetch
    const handleAddUpdate = (product, addEdit) =>{
        setAddEdit(addEdit)
        if(addEdit==='PUT'){           
            setIdUpdate(product.product_id)
            setForm({
                name: product.name,
                description: product.description,
                warranty: product.warranty,
                price: product.price,
                stock: product.stock,
                image: product.image,
                rating:null,
            })
        }else{
            setIdUpdate('')
            setForm({
                name: '',
                description: '',
                warranty: '',
                price:'',
                stock: '',
                image:'',
                rating:null,
            })
        }
        handleSubmitCat()
        setShow(true);
    }

    //Delete del producto por el Id
    const handleDelete = () => {
        const deletear = fetch(`http://localhost:3001/products/${idEliminar}`, {
            method: 'DELETE',
            headers:{
                'Content-type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('actualToken')}`
            }
        })
        deletear.then( res => {
            getProducts(view, searchInput, selectedCategory, currentPage);
            handleCloseElim();
        })
    }

    //handleSubmit envia los datos para crear o actualizar un registro
    const handleSubmit = (e) =>{
        // console.log(idUpdate);
        e.preventDefault();

        fetch(`http://localhost:3001/products/${idUpdate&&idUpdate}`, {
            method: addEdit, //POST or 'PUT'
            body: JSON.stringify(form), // data can be `string` or {object}!
            headers:{
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('actualToken')}`
            }
        })
        .then(res=>res.json())
        .then(res => {
            //traigo de nuevo los products de la db
            getProducts(view, searchInput, selectedCategory, currentPage);
            handleSubmitCat(res.product_id)
        })
        handleClose()
    } 

    const handleSubmitCat = (idp) =>{
        let idprod = idp || idUpdate
        fetch(`http://localhost:3001/products/${idprod}/category/${idCategoria}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('actualToken')}`
            }
        }).then(res => res.text())
        .then(res => {
            getProducts(view, searchInput, selectedCategory, currentPage);
        })
    }
    const categorias = (cate) => {
        const options = []
        for (const objeto of cate) {
            options.push(objeto)
        }
        const newOp=[]
        for (let i = 0; i < options.length; i++) {
            newOp.push({value:options[i].category_id,label:options[i].name})
        }
        console.log(newOp)
        return newOp
    }
    const handleChangeCat = selectedOption => {
        setIdCategoria(selectedOption.value);
        //console.log(`Option selected:`, selectedOption.value);
    }
    


    
    //state para mostrar/esconder el modal de imagenes
    const [ showImgs, setShowImgs ] = useState(false);
    //información del producto cuyas imágenes va a mostrar el modal de imágenes (incluye nombre, id, etc. Todo)
    const [ imgModalData, setImgModalData ] = useState({
        images: []
    });
    //hace el fetch para borrar la imagen cuando se clickea el botón eliminar en el modal de imágenes
    const handleOnClickDeleteImg = (product_id, img_id) => {
        console.log(imgModalData)
        fetch(`http://localhost:3001/products/${product_id}/images/${img_id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('actualToken')}`
            }
        })
        .then( () =>  fetch(`http://localhost:3001/products/${product_id}/images`))
        .then(response => response.json())
        .then(newImages => {
            setImgModalData({
                ...imgModalData,
                images: newImages
            });
            setAddImgURL('');
        })
        .catch(error => console.log(error));
    };
    //URL de imagen para agregarla a un producto en el modal de imágenes
    const [ addImgURL, setAddImgURL ] = useState()
    const addImg = (e) => {
        e.preventDefault();

        const { product_id } = imgModalData;

        fetch(`http://localhost:3001/products/${product_id}/images`, {
            method: 'POST',
            body: JSON.stringify({
                img_url: addImgURL
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('actualToken')}`
            }
        })
        //Utilizo la ruta /products/:product_id/images
        //para traer sólo las imágenes del producto al que le agregué una.
        .then( () => fetch(`http://localhost:3001/products/${product_id}/images`))
        .then(response => response.json())
        .then(newImages => {
            setImgModalData({
                ...imgModalData,
                images: newImages
            });
            setAddImgURL('')
        })
        .catch(error => console.log(error));
    };


    useEffect( () => {
        getProducts(view, searchInput, selectedCategory, currentPage);
        getCategories();
    }, [imgModalData, view, selectedCategory, currentPage, searchInput]);
    
    return (
        <>
            <div className={style.mainWrapper}>

                <div className={style.inputWrapper}>
                    <Button variant='info' className={`mb-3 ${style.addButton}`}  onClick={()=>handleAddUpdate('', 'POST')}>+</Button>
                    <div className={`col-md-8 offset-2 pt-3 ${style.inputs}`}>

                        <TextField
                            className={style.input}
                            type='text'
                            label='Buscar por nombre'
                            onChange = {e => search(e.target.value)}
                        />

                        <TextField
                            className={style.input}
                            type='text'
                            label='Buscar por ID'
                            // onChange = {e => search(e.target.value)}
                        />
                        <FormControl className={style.input}>
                            <InputLabel id="demo-simple-select-label">
                                Filtrar según categoría
                            </InputLabel>
                            <Selectt
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value='' 
                                onChange={e=>selectCategory(e.target.value)}
                            >
                            {categories.map( c => 
                                <MenuItem value={c.name}>{c.name}</MenuItem>
                                )}
                            </Selectt>
                        </FormControl>
                    </div>
                </div>
                
                <div className={`col-md-8 offset-2 pt-3 table-responsive ${style.productsTable}`}>
                {view === 'Category' && <h5>Mostrando los productos de la categoría {selectedCategory}</h5>}
                {view === 'Search' && <h5>Búsqueda de productos: '{searchInput}'</h5>}

                {/* Componentes de react-bootstrap */}
                <table style={{backgroundColor: 'whitesmoke'}} className='table table-striped table-collapse'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Garantía</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Imágenes <p style={{fontSize: '10px'}}>(clickear)</p></th>
                            <th>Categorías</th>
                            <th></th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(prod => 
                            <tr style={{height: '100px', padding: 'auto 0'}} key={prod.product_id}>
                                <td >{prod.product_id}</td>
                                <td><a href={`${prod.product_id}`}>{prod.name}</a></td>
                                <td>{prod.description.length>15?prod.description.slice(0, 15)+'...':prod.description}</td>
                                <td>{prod.warranty}</td>
                                <td>{prod.price}</td>
                                <td>{prod.stock}</td>
                                <td onClick={()=>{
                                    setImgModalData(prod);
                                    //setIdProducto(prod.product_id);
                                    setShowImgs(true);
                                    }} style={{alignItems:'center'}}><img className={style.prodImg} src={prod.images[0].img_url} style={style.img}/></td>
                                <td><ul style={{listStyleType:'none',padding:'0'}}>{prod.categories.map((cat)=>{return <li key={cat.category_id}>{cat.name}</li>})}</ul></td>
                                <td><Button variant='primary' onClick={()=>handleAddUpdate(prod, 'PUT')}>
                                    <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-pencil-square" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                        <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                    </svg>    
                                </Button></td>
                                <td><Button variant='danger' onClick={ () => {handleShowElim(); setIdEliminar(prod.product_id);} } >
                                <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-trash" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                </svg>    
                                </Button></td>
                            </tr>
                        )}     
                    </tbody>       
                </table>

                    {/* NAVEGACIÓN DE PÁGINAS */}
                <div className={`d-flex justify-content-around`}>
                    {currentPage > 1 ? <Button  onClick={retrocederPagina}
                        ><FaArrowCircleLeft/></Button> : <FaArrowCircleLeft/>}

                        <span >{currentPage}</span>

                    {!(products.length < 25) ? <Button  onClick={avanzarPagina}
                        ><FaArrowCircleRight/></Button> : <FaArrowCircleRight/>}
                </div>

                {/* MODAL EDITAR/AGREGAR PRODUCTO */}
                <Modal show={show} onHide={handleClose}>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group>
                        <Modal.Header closeButton>
                        <Modal.Title>{ addEdit==='POST'?'Agregar':'Editar'} Producto</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Label>Ingrese el nombre del producto</Form.Label>
                            <Form.Control id='name' name='name' value={form.name} type="text" placeholder="Ingrese Producto" onChange={updateField} />
                            <Form.Label>Ingrese la descripción del producto</Form.Label>
                            <Form.Control id='description' name='description' value={form.description} type="text" placeholder="Ingrese Descripcion" onChange={updateField}/>                    
                            <Form.Label>Garantía (días)</Form.Label>
                            <Form.Control id='warranty' name='warranty' value={form.warranty} type="number" placeholder="Ingrese Tiempo de Garantía" onChange={updateField}/> 
                            <Form.Label>Ingrese el precio</Form.Label>
                            <Form.Control id='price' name='price' value={form.price} type="number" placeholder="Precio" onChange={updateField}/> 
                            <Form.Label>Ingrese el stock</Form.Label>
                            <Form.Control id='stock' name='stock' value={form.stock} type="text" placeholder="Ingrese Existencias" onChange={updateField}/> 
                            <Form.Label>Ingrese una imagen [URL]</Form.Label>
                            <Form.Control id='image' name='image' value={form.image} type="text" placeholder="Ingrese Url de Imagen" onChange={updateField}/>                  
                            <Form.Label>Categorias</Form.Label>
                            <Select options ={categorias(categories)} onChange={handleChangeCat}/>     
                        </Modal.Body>
                        <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Cerrar
                        </Button>
                        <Button variant="primary" type='submit'>
                            {addEdit === 'POST' ? 'Guardar' :'Guardar cambios'}
                        </Button>                
                        </Modal.Footer>
                        </Form.Group>
                    </Form>
                </Modal>

                {/* MODAL ELIMINAR PRODUCTO */}
                <Modal show={showModalEliminar} onHide={handleCloseElim}>
                            <Modal.Header closeButton>
                                <Modal.Title> Seguro que desea eliminar el producto?</Modal.Title>
                            </Modal.Header>
                            <Modal.Footer>
                                <Button variant="danger" onClick={()=>handleDelete(idEliminar)}>
                                    Sí
                                </Button>
                                <Button variant="primary"  onClick={()=>handleCloseElim()}>
                                    No
                                </Button>                
                            </Modal.Footer>
                </Modal>

                {/* MODAL IMAGENES    */}
                <Modal show={showImgs}>
                    <Modal.Header>
                        <Modal.Title>Administrar imágenes de "{imgModalData.name}"</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p style={{fontSize:'12px'}}>Recuerde que los productos deben tener al menos una imagen</p>
                        <ul style={{listStyleType: 'none'}}>
                            {imgModalData.images.map(img=>{
                                
                                const { img_url, img_id } = img;
                                const { product_id } = imgModalData;
                                
                                
                                return (
                                <li key={img_id}>
                                    <div style={{'margin': '7px'}}>
                                        <img src={img_url} style={{'width': '100px', marginRight: '40px'}} alt={`Imagen ID ${img_id}`}></img>
                                        {/* Sólo debería estar disponible el botón de eliminar si el producto tiene más de una imagen, para que no queden productos sin imagen */}
                                        {imgModalData.images.length > 1 && <Button variant="danger" style={{borderRadius: '20px'}} onClick={()=>handleOnClickDeleteImg(product_id, img_id)}> X </Button>}
                                    </div>
                                </li>
                                );
                            })}
                        </ul>
                        <br/>
                        {/* Para agregar una imagen al producto */}
                        <h4>Agregar nueva imagen</h4>
                        <Form onSubmit={addImg}>
                            <Form.Label>Ingrese una URL de imagen</Form.Label>
                            <Form.Control id='imgURL' name='imgURL' value={addImgURL} type="text" placeholder="Ingrese URL de Imagen" onChange={(e)=>{setAddImgURL(e.target.value)}}/>
                            <Button type='submit' style={{borderRadius: '5px', fontWeight: 'bold',marginTop:'10px'}}>Agregar imagen</Button>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={()=>{
                            setShowImgs(false);
                            setAddImgURL('');
                        }}>Listo</Button>
                    </Modal.Footer>
                </Modal>                       
            </div>
        </div>
        </>
    )
}




const mapStateToProps = state => {
    return{
        user : state.auth.user,
        isFetching: state.auth.isFetching,
        view: state.crud.settings.view,
        searchInput: state.crud.settings.searchInput,
        selectedCategory: state.crud.settings.selectedCategory,
        currentPage: state.crud.settings.currentPage,
        products: state.crud.products
    }
}

const mapDispatchToProps = dispatch => {
    return {
        search: input => dispatch(search(input)),
        changePage: num => dispatch(changePage(num)),
        selectCategory: category => dispatch(selectCategory(category)),
        selectAll: () => dispatch(selectAll()),
        getProducts: (view, searchInput, selectedCategory, currentPage) => dispatch(getProducts(view, searchInput, selectedCategory, currentPage))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Crud);