import { ToastContainer } from 'react-toastify'
import './App.css'

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
    </>
  )
}

export default App
