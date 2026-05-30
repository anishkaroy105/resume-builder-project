import { FilePenLineIcon, LoaderCircleIcon, PencilIcon, PlusIcon, TrashIcon, UploadCloud, UploadCloudIcon, XIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { dummyResumeData } from '../assets/assets'
import {useNavigate} from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import pdfToText from 'react-pdftotext'

const Dashboard = () => {

  const {user, token} = useSelector(state => state.auth)

  const colors = ["#9333ea", "#d97706", "#dc2626", "#0284c7", "#16a34a"]
  const [allResumes, setAllResumes] = useState([])
  const [showCreateResume, setShowCreateResume] = useState(false)
  const [showUploadResume, setShowUploadResume] = useState(false)
  const [title, setTitle] = useState('')
  const [resume, setResume] = useState(null)
  const [editResumeId, setEditResumeId] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const loadAllResumes = async () =>{
    try {
      const { data } = await api.get('/api/users/resumes', {headers: { Authorization: token }})
      setAllResumes(data.resumes)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  const createResume = async (event) => {
   try {
    event.preventDefault()
    const { data } = await api.post('/api/resumes/create', {title}, {headers: { Authorization: token }})
    setAllResumes([...allResumes, data.resume])
    setTitle('')
    setShowCreateResume(false)
    navigate(`/app/builder/${data.resume._id}`)
   } catch (error) {
    toast.error(error?.response?.data?.message || error.message)
   }
  }

  const uploadResume = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      const resumeText = await pdfToText(resume)
      const { data } = await api.post('/api/ai/upload-resume', {title, resumeText}, {headers: { Authorization: token }})
      setTitle('')
      setResume(null)
      setShowUploadResume(false)
      navigate(`/app/builder/${data.resumeId}`)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
    setIsLoading(false)
  }

  const editTitle = async (event) => {
    try {
      event.preventDefault()
      const {data} = await api.put(`/api/resumes/update`, {resumeId: editResumeId, resumeData: { title }}, {headers: { Authorization: token }})
      setAllResumes(allResumes.map(resume => resume._id === editResumeId ? { ...resume, title } : resume))
      setTitle('')
      setEditResumeId('')
      toast.success(data.message)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
     
  }

  const deleteResume = async (resumeId) => {
    try {
      const confirm = window.confirm('Are you sure you want to delete this resume?')
     if(confirm){
      const {data} = await api.delete(`/api/resumes/delete/${resumeId}`, {headers: { Authorization: token }})
      setAllResumes(allResumes.filter(resume => resume._id !== resumeId))
      toast.success(data.message)
     }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
     
  }

  useEffect(()=>{
    loadAllResumes()
  },[])

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>

        {/* Premium Header */}
        <div className='mb-10 sm:mb-12'>
          <h1 className='text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent'>
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className='text-slate-600 text-base sm:text-lg'>Create and manage your professional resumes</p>
        </div>

        {/* Action Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12'>
          <button 
            onClick={()=> setShowCreateResume(true)} 
            className='group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 text-left'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500'></div>
            <div className='relative z-10'>
              <div className='inline-flex p-3 bg-white/20 backdrop-blur-sm rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300'>
                <PlusIcon className='size-7 text-white'/>
              </div>
              <h3 className='text-xl font-bold text-white mb-2'>Create New Resume</h3>
              <p className='text-indigo-100 text-sm'>Start from scratch with a blank template</p>
            </div>
          </button>

          <button 
            onClick={()=> setShowUploadResume(true)} 
            className='group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 text-left'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500'></div>
            <div className='relative z-10'>
              <div className='inline-flex p-3 bg-white/20 backdrop-blur-sm rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300'>
                <UploadCloudIcon className='size-7 text-white'/>
              </div>
              <h3 className='text-xl font-bold text-white mb-2'>Upload Existing Resume</h3>
              <p className='text-purple-100 text-sm'>Import your PDF and let AI extract the data</p>
            </div>
          </button>
        </div>

        {/* Resumes Section */}
        <div className='mb-6'>
          <h2 className='text-2xl font-bold text-slate-800 mb-6'>Your Resumes</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {allResumes.map((resume, index)=>{
            const baseColor = colors[index % colors.length];
            return (
              <div key={index} className="relative group flex flex-col items-stretch">
                {/* Floating Action Buttons */}
                <div className="absolute -top-4 right-2 z-20 flex gap-2">
                  <button
                    onClick={e => {e.stopPropagation(); setEditResumeId(resume._id); setTitle(resume.title);}}
                    className="p-2.5 bg-white/95 hover:bg-indigo-100 rounded-2xl shadow-lg text-slate-700 hover:text-indigo-700 border border-slate-100 hover:border-indigo-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    style={{ minWidth: 44, minHeight: 44 }}
                    title="Edit Resume"
                  >
                    <PencilIcon className="size-5"/>
                  </button>
                  <button
                    onClick={e => {e.stopPropagation(); deleteResume(resume._id);}}
                    className="p-2.5 bg-white/95 hover:bg-red-100 rounded-2xl shadow-lg text-slate-700 hover:text-red-700 border border-slate-100 hover:border-red-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                    style={{ minWidth: 44, minHeight: 44 }}
                    title="Delete Resume"
                  >
                    <TrashIcon className="size-5"/>
                  </button>
                </div>
                <button 
                  onClick={()=> navigate(`/app/builder/${resume._id}`)} 
                  className='relative bg-white rounded-2xl border-2 hover:shadow-2xl transition-all duration-500 overflow-hidden p-7 pt-10 text-left h-56 flex flex-col group/card' 
                  style={{borderColor: baseColor + '30'}}>
                  {/* Gradient Background Effect */}
                  <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500' style={{background: `linear-gradient(135deg, ${baseColor}08, ${baseColor}15)`}}></div>
                  {/* Content */}
                  <div className='relative z-10 flex-1 flex flex-col'>
                    <div className='inline-flex p-3 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm' style={{background: baseColor + '15'}}>
                      <FilePenLineIcon className="size-6" style={{ color: baseColor }}/>
                    </div>
                    <h3 className='text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-slate-900'>{resume.title}</h3>
                    <div className='mt-auto pt-4 border-t border-slate-100'>
                      <p className='text-xs text-slate-500'>
                        Updated {new Date(resume.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {/* Premium Card Shine Effect */}
                  <div className="pointer-events-none absolute left-0 top-0 w-full h-full rounded-2xl overflow-hidden">
                    <div className="absolute left-[-60%] top-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 rotate-6" style={{animation: 'shine 1.5s linear infinite'}}></div>
                  </div>
                </button>
              </div>
            )
          })}
      </div>

        {showCreateResume && (
          <form onSubmit={createResume} onClick={()=> setShowCreateResume(false)} className='fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200'>
            <div onClick={e => e.stopPropagation()} className='relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-300'>
              <div className='mb-6'>
                <div className='inline-flex p-3 bg-indigo-100 rounded-xl mb-4'>
                  <PlusIcon className='size-6 text-indigo-600'/>
                </div>
                <h2 className='text-2xl font-bold text-slate-800 mb-2'>Create New Resume</h2>
                <p className='text-slate-600 text-sm'>Give your resume a memorable title</p>
              </div>
              <input 
                onChange={(e)=>setTitle(e.target.value)} 
                value={title} 
                type="text" 
                placeholder='e.g., Software Engineer Resume' 
                className='w-full px-4 py-3 mb-6 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-800' 
                required
              />
              <button className='w-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300'>
                Create Resume
              </button>
              <button 
                type='button'
                onClick={()=> {setShowCreateResume(false); setTitle('')}} 
                className='absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all'>
                <XIcon className='size-5'/>
              </button>
            </div>
          </form>
        )}

        {showUploadResume && (
          <form onSubmit={uploadResume} onClick={()=> setShowUploadResume(false)} className='fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200'>
            <div onClick={e => e.stopPropagation()} className='relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-300'>
              <div className='mb-6'>
                <div className='inline-flex p-3 bg-purple-100 rounded-xl mb-4'>
                  <UploadCloudIcon className='size-6 text-purple-600'/>
                </div>
                <h2 className='text-2xl font-bold text-slate-800 mb-2'>Upload Resume</h2>
                <p className='text-slate-600 text-sm'>AI will extract data from your PDF</p>
              </div>
              <input 
                onChange={(e)=>setTitle(e.target.value)} 
                value={title} 
                type="text" 
                placeholder='e.g., My Professional Resume' 
                className='w-full px-4 py-3 mb-4 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-slate-800' 
                required
              />
              <div>
                <label htmlFor="resume-input" className="block text-sm font-medium text-slate-700 mb-2">
                  Resume File (PDF)
                </label>
                <label htmlFor="resume-input" className='flex flex-col items-center justify-center border-2 border-dashed group text-slate-400 border-slate-300 rounded-xl p-8 hover:border-purple-500 hover:bg-purple-50/50 cursor-pointer transition-all'>
                  {resume ? (
                    <div className='text-center'>
                      <div className='inline-flex p-3 bg-purple-100 rounded-xl mb-3'>
                        <UploadCloud className='size-8 text-purple-600'/>
                      </div>
                      <p className='text-purple-600 font-medium'>{resume.name}</p>
                      <p className='text-xs text-slate-500 mt-1'>Click to change</p>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className='size-12 stroke-1 mb-3 group-hover:text-purple-500 transition-colors'/>
                      <p className='font-medium text-slate-600 group-hover:text-purple-600 transition-colors'>Click to upload</p>
                      <p className='text-xs text-slate-500 mt-1'>PDF format only</p>
                    </>
                  )}
                </label>
                <input type="file" id='resume-input' accept='.pdf' hidden onChange={(e)=> setResume(e.target.files[0])}/>
              </div>
              <button 
                disabled={isLoading} 
                className='w-full mt-6 py-3.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'>
                {isLoading && <LoaderCircleIcon className='animate-spin size-5'/>}
                {isLoading ? 'Processing...' : 'Upload & Extract'}
              </button>
              <button 
                type='button'
                onClick={()=> {setShowUploadResume(false); setTitle('')}} 
                className='absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all'>
                <XIcon className='size-5'/>
              </button>
            </div>
          </form>
        )}

        {editResumeId && (
          <form onSubmit={editTitle} onClick={()=> setEditResumeId('')} className='fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200'>
            <div onClick={e => e.stopPropagation()} className='relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-300'>
              <div className='mb-6'>
                <div className='inline-flex p-3 bg-blue-100 rounded-xl mb-4'>
                  <PencilIcon className='size-6 text-blue-600'/>
                </div>
                <h2 className='text-2xl font-bold text-slate-800 mb-2'>Edit Resume Title</h2>
                <p className='text-slate-600 text-sm'>Update the title of your resume</p>
              </div>
              <input 
                onChange={(e)=>setTitle(e.target.value)} 
                value={title} 
                type="text" 
                placeholder='Enter resume title' 
                className='w-full px-4 py-3 mb-6 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800' 
                required
              />
              <button className='w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300'>
                Update Title
              </button>
              <button 
                type='button'
                onClick={()=> {setEditResumeId(''); setTitle('')}} 
                className='absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all'>
                <XIcon className='size-5'/>
              </button>
            </div>
          </form>
        )}
      
      </div>
    </div>
  )
}

export default Dashboard
