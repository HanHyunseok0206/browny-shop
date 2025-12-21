import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import { db } from './firebase'; 
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";

// 🏠 1. 홈 화면 (브랜드 대문)
function Home() {
  return (
    <div className="home-container">
      <div className="hero-overlay">
        <h1>2025 S/S COLLECTION</h1>
        <p>Discover Your Identity</p>
        <Link to="/shop" className="hero-btn">SHOP NOW</Link>
      </div>
    </div>
  );
}

// 🛍️ 2. 쇼핑하기 (상품 목록)
function Shop({ addToCart }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const data = await getDocs(q);
      setProducts(data.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    getProducts();
  }, []);

  return (
    <div className="shop-container">
      <h2 className="page-title">ALL PRODUCTS</h2>
      <div className="product-grid">
        {products.map((item) => (
          <div key={item.id} className="product-card">
            <div className="img-wrapper">
              <img src={item.imageUrl} alt={item.name} />
              {/* 마우스 올리면 장바구니 버튼 등장 */}
              <button className="add-cart-btn" onClick={() => addToCart(item)}>
                + CART
              </button>
            </div>
            <div className="info">
              <h3>{item.name}</h3>
              <p className="price">₩ {item.price.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🛒 3. 장바구니 페이지
function Cart({ cart, removeFromCart }) {
  const total = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="cart-container">
      <h2 className="page-title">SHOPPING BAG ({cart.length})</h2>
      
      {cart.length === 0 ? (
        <div className="empty-cart">
          <p>장바구니가 비어있습니다.</p>
          <Link to="/shop" className="black-btn">쇼핑하러 가기</Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-list">
            {cart.map((item, index) => (
              <div key={index} className="cart-item">
                <img src={item.imageUrl} alt={item.name} />
                <div className="cart-info">
                  <h3>{item.name}</h3>
                  <p>₩ {item.price.toLocaleString()}</p>
                  <button onClick={() => removeFromCart(index)} className="remove-btn">삭제</button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>ORDER SUMMARY</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₩ {total.toLocaleString()}</span>
            </div>
            <button className="checkout-btn" onClick={() => alert("준비 중입니다!")}>
              CHECKOUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 🔧 4. 관리자 (기존과 동일)
// App.jsx 안에 있는 Admin 함수를 이걸로 교체하세요!

// 🔧 4. 관리자 (등록 + 삭제 기능 추가됨)
function Admin() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [products, setProducts] = useState([]); // 관리자용 상품 목록
  const navigate = useNavigate();

  // 화면 켜지자마자 상품 목록 가져오기
  const getProducts = async () => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const data = await getDocs(q);
    setProducts(data.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    getProducts();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; 
        let width = img.width; let height = img.height;
        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        setImage(canvas.toDataURL('image/jpeg', 0.8));
      };
    };
  };

  const addProduct = async () => {
    if (!name || !price || !image) return alert("정보를 모두 입력해주세요.");
    await addDoc(collection(db, "products"), {
      name, price: Number(price), imageUrl: image, createdAt: new Date()
    });
    alert("등록 완료!");
    // 입력창 초기화 및 목록 새로고침
    setName(""); setPrice(""); setImage(null);
    getProducts();
  };

  // 🗑️ 상품 삭제 함수
  const deleteProduct = async (id) => {
    if(window.confirm("정말 이 상품을 삭제하시겠습니까?")) {
      await deleteDoc(doc(db, "products", id));
      alert("삭제되었습니다.");
      getProducts(); // 목록 다시 불러오기
    }
  };

  return (
    <div className="admin-container">
      <h2 className="page-title">MANAGER MODE</h2>
      
      {/* 상품 등록 구역 */}
      <div className="form-box">
        <input placeholder="Product Name" value={name} onChange={(e)=>setName(e.target.value)} />
        <input type="number" placeholder="Price" value={price} onChange={(e)=>setPrice(e.target.value)} />
        <input type="file" onChange={handleImageChange} accept="image/*" />
        {image && <img src={image} className="preview" alt="preview" />}
        <button onClick={addProduct} className="black-btn">UPLOAD PRODUCT</button>
      </div>

      <hr style={{margin: "50px 0", border: "none", borderTop: "1px solid #eee"}}/>

      {/* 상품 관리 리스트 (삭제 구역) */}
      <h3>📦 재고 관리 ({products.length})</h3>
      <div className="admin-list">
        {products.map((item) => (
          <div key={item.id} className="admin-item">
            <img src={item.imageUrl} alt="thumb" />
            <div className="admin-info">
              <span className="name">{item.name}</span>
              <span className="price">₩ {item.price.toLocaleString()}</span>
            </div>
            <button onClick={() => deleteProduct(item.id)} className="delete-btn-small">삭제</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🧭 5. 전체 앱 (상태 관리 & 라우터)
function App() {
  const [cart, setCart] = useState([]); // 장바구니 상태 (전역 관리)

  // 장바구니 담기 함수
  const addToCart = (product) => {
    setCart([...cart, product]);
    if(window.confirm(`${product.name}을(를) 장바구니에 담았습니다.\n장바구니로 이동할까요?`)) {
      // 확인 누르면 장바구니로 이동하는 기능은 Link로 대체하거나 여기서 처리 가능
    }
  };

  // 장바구니 삭제 함수
  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <Link to="/" className="logo">BROWNY<span className="sub-logo">made by. Jung&Han</span>
  </Link>
          <div className="menu">
            <Link to="/shop">SHOP</Link>
            <Link to="/cart">CART ({cart.length})</Link> {/* 숫자 표시 */}
            <Link to="/admin">ADMIN</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop addToCart={addToCart} />} />
          <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;