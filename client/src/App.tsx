import './App.css'
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
function App() {

  return (
    <>
    <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  )
}

export default App
