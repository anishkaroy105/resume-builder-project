import imagekit from "../configs/imageKit.js";
import Resume from "../models/Resume.js";
import fs from 'fs';


// controller for creating a new resume
// POST: /api/resumes/create
export const createResume = async (req, res) => {
    try {
        const userId = req.userId;
        const {title} = req.body;

        const newResume = await Resume.create({userId, title})
        return res.status(201).json({message: 'Resume created successfully', resume: newResume})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// controller for deleting a resume
// DELETE: /api/resumes/delete
export const deleteResume = async (req, res) => {
    try {
        const userId = req.userId;
        const {resumeId} = req.params;

       await Resume.findOneAndDelete({userId, _id: resumeId})

        return res.status(200).json({message: 'Resume deleted successfully'})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}


// get user resume by id
// GET: /api/resumes/get
export const getResumeById = async (req, res) => {
    try {
        const userId = req.userId;
        const {resumeId} = req.params;

       const resume = await Resume.findOne({userId, _id: resumeId})

       if(!resume){
        return res.status(404).json({message: "Resume not found"})
       }

        resume.__v = undefined;
        resume.createdAt = undefined;
        resume.updatedAt = undefined;

        return res.status(200).json({resume})

    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// get resume by id public
// GET: /api/resumes/public
export const getPublicResumeById = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const resume = await Resume.findOne({public: true, _id: resumeId})

        if(!resume){
        return res.status(404).json({message: "Resume not found"})
       }

       return res.status(200).json({resume})
    } catch (error) {
         return res.status(400).json({message: error.message})
    }
}

// controller for updating a resume
// PUT: /api/resumes/update
export const updateResume = async (req, res) =>{
    try {
        const userId = req.userId;
        const {resumeId, resumeData} = req.body
        const image = req.file;
        
        let resumeDataCopy; 
        if(typeof resumeData === 'string'){
            resumeDataCopy = JSON.parse(resumeData)
        }else{
            resumeDataCopy = structuredClone(resumeData)
        }

        
        delete resumeDataCopy._id;
        delete resumeDataCopy.userId;
        delete resumeDataCopy.createdAt;
        delete resumeDataCopy.updatedAt;
        delete resumeDataCopy.__v;

        if(image){
            const imageBufferData = fs.readFileSync(image.path)
            const base64Image = imageBufferData.toString('base64')

            const uploadOptions = {
                file: base64Image,
                fileName: image.filename,
                folder: 'user-resumes'
            };

            const response = await imagekit.upload(uploadOptions);
            
            const transformations = 'tr:w-300,h-300,fo-face,z-0.75';
            const imageUrl = response.url.replace('/user-resumes/', `/user-resumes/${transformations}/`);
            
            resumeDataCopy.personal_info.image = imageUrl
            
            fs.unlinkSync(image.path)
        }

       const resume = await Resume.findOneAndUpdate(
           {_id: resumeId, userId}, 
           resumeDataCopy, 
           {new: true, runValidators: false}
       )

       if(!resume){
           return res.status(404).json({message: 'Resume not found'})
       }

       return res.status(200).json({message: 'Saved successfully', resume})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}