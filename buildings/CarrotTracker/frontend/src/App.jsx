import React, { useContext, useEffect } from 'react'
import Layout from './components/Layout'
import { AppContext } from './context/AppContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  const { serverStatus, lang } = useContext(AppContext);

  useEffect(() => {
    if (serverStatus === 'offline') {
      toast.error(lang === 'en' ? "Server Unreachable" : "השרת אינו זמין", {
        position: "bottom-right",
        autoClose: false
      });
    }
  }, [serverStatus]);

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-3xl font-black mb-4 text-gray-800 uppercase tracking-tighter">
            Building Status
          </h2>
          <p className="text-gray-500 leading-relaxed mb-6">
            A system to monitor the growth of ginger carrots in the north field.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-bold">
            <span>🦊</span>
            <span>Ginger Chinchilla Guarding: ACTIVE</span>
          </div>
        </div>

        <div className="p-8 bg-gray-900 rounded-2xl shadow-xl text-white">
          <h3 className="text-xl font-bold mb-4 text-orange-400">System Logs</h3>
          <div className="font-mono text-sm space-y-2 opacity-80">
            <p>> Initializing CarrotTracker...</p>
            <p>> Checking infrastructure sync...</p>
            <p className={serverStatus === 'online' ? 'text-green-400' : 'text-red-400'}>
                > Backend connection: {serverStatus.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
      <ToastContainer theme="colored" />
    </Layout>
  )
}
export default App
