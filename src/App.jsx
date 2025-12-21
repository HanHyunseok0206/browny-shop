import { useState, useEffect } from 'react';
import './App.css';
import { db } from './firebase'; // 방금 만든 firebase.js 가져오기
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";

function App() {
  const [diary, setDiary] = useState(""); // 일기 내용
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
// 이렇게 하면 "2023-12-21" 처럼 날짜가 채워진 상태로 시작함!
  const [list, setList] = useState([]);   // 일기 목록

  // 1. 데이터 불러오기 (새로고침 해도 유지됨!)
  const getDiaries = async () => {
    // "diaries"라는 이름의 데이터 방에서 글을 가져와라 (날짜순 정렬)
    const q = query(collection(db, "diaries"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    
    // 가져온 데이터를 우리가 쓰는 배열 형태로 변환
    const dataArray = querySnapshot.docs.map(doc => ({
      id: doc.id, 
      ...doc.data()
    }));
    setList(dataArray);
  };

  // 앱이 켜지자마자 데이터 한 번 불러오기
  useEffect(() => {
    getDiaries();
  }, []);

  // 2. 일기 저장하기 (파이어베이스로 보냄)
  const addDiary = async () => {
    if (diary === "" || date === "") {
      alert("날짜와 내용을 모두 적어주세요!");
      return;
    }

    try {
      // "diaries"라는 방에 데이터 추가
      await addDoc(collection(db, "diaries"), {
        date: date,
        content: diary,
        createdAt: new Date() // 만든 시간
      });
      
      alert("일기가 저장되었습니다! 📘");
      setDiary(""); // 입력창 비우기
      getDiaries(); // 목록 다시 불러오기
    } catch (e) {
      console.error("에러 발생: ", e);
      alert("저장에 실패했습니다 ㅠㅠ");
    }
  };

  // 3. 삭제하기
  const deleteDiary = async (id) => {
    if(window.confirm("정말 삭제하시겠습니까?")) {
      await deleteDoc(doc(db, "diaries", id));
      getDiaries(); // 목록 다시 불러오기
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
            <p className="diary-content">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;