import { useState, useEffect } from 'react';
import './App.css';
import { db } from './firebase'; 
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";

function App() {
  const [diary, setDiary] = useState(""); // 일기 내용
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [list, setList] = useState([]);   // 일기 목록
  
  // 🆕 1. 사진을 담을 공간(State) 추가
  const [image, setImage] = useState(null); 

  // 데이터 불러오기
  const getDiaries = async () => {
    const q = query(collection(db, "diaries"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    const dataArray = querySnapshot.docs.map(doc => ({
      id: doc.id, 
      ...doc.data()
    }));
    setList(dataArray);
  };

  useEffect(() => {
    getDiaries();
  }, []);

  // 🆕 2. 사진 파일을 선택하면 "아주 긴 글자"로 바꿔주는 마법의 함수
  // 📸 사진 압축 함수 (고화질 사진을 800px로 줄여서 용량 다이어트!)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file); // 1. 파일을 읽고
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        // 2. 가상의 캔버스(도화지)를 만들어서 사진을 그립니다.
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // 가로 크기를 800px로 제한 (충분히 잘 보임)
        
        // 비율 유지하면서 크기 계산
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // 3. 다시 글자로 변환 (JPEG 형식, 퀄리티 0.7로 압축)
        // 이렇게 하면 5MB짜리 사진이 50KB로 확 줄어듭니다!
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setImage(dataUrl);
      };
    };
  };

  // 일기 저장하기
  const addDiary = async () => {
    if (diary === "" || date === "") {
      alert("날짜와 내용을 모두 적어주세요!");
      return;
    }

    try {
      await addDoc(collection(db, "diaries"), {
        date: date,
        content: diary,
        imageUrl: image, // 🆕 3. 변환된 사진 글자도 같이 저장!
        createdAt: new Date()
      });
      
      alert("일기가 저장되었습니다! 📘");
      setDiary(""); 
      setImage(null); // 🆕 4. 사진도 초기화
      getDiaries(); 
    } catch (e) {
      console.error("에러 발생: ", e);
      alert("저장에 실패했습니다 ㅠㅠ (사진 용량이 너무 클 수도 있어요!)");
    }
  };

  const deleteDiary = async (id) => {
    if(window.confirm("정말 삭제하시겠습니까?")) {
      await deleteDoc(doc(db, "diaries", id));
      getDiaries(); 
    }
  }

  return (
    <div className="container">
      <h1>📅 나만의 비밀 일기장</h1>
      
      <div className="input-box">
        <input 
          type="date" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{marginBottom: '10px'}}
        />
        
        {/* 🆕 5. 사진 선택 버튼 추가 */}
        <label style={{fontSize: "14px", fontWeight: "bold", marginBottom: "5px"}}>📸 사진 추가하기</label>
        <input 
          type="file" 
          accept="image/*"
          onChange={handleImageChange}
          style={{marginBottom: '10px', background: "white"}} 
        />

        {/* 선택한 사진 미리보기 */}
        {image && <img src={image} alt="미리보기" style={{width: "100px", borderRadius: "10px", marginBottom: "10px"}} />}

        <textarea 
          placeholder="오늘 무슨 일이 있었나요?"
          value={diary}
          onChange={(e) => setDiary(e.target.value)}
          rows="3"
        />
        <button onClick={addDiary}>일기 저장하기 💾</button>
      </div>

      <hr />

      <div className="list-area">
        {list.map((item) => (
          <div key={item.id} className="diary-card">
            <div className="diary-header">
              <span className="diary-date">{item.date}</span>
              <button onClick={() => deleteDiary(item.id)} className="delete-btn">X</button>
            </div>
            
            {/* 🆕 6. 사진이 있으면 보여주기 */}
            {item.imageUrl && (
              <img 
                src={item.imageUrl} 
                alt="일기 사진" 
                style={{ width: "100%", borderRadius: "10px", marginTop: "10px", marginBottom: "10px" }} 
              />
            )}

            <p className="diary-content">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;