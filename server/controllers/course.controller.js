import course from "../models/course.model.js";
import apperror from '../utils/error.util.js'
import cloudinary from 'cloudinary';
import fs from 'fs/promises';
const getallcourses=async(req,res,next)=>
{
    try
    {
        const courses=await course.find({}).select('-lectures');

    res.status(200).json(
        {
            sucess:true,
            message:"all courses ",
            courses,
        }
    )
    }catch(e)
    {
        return next(new apperror(e.message,400));
    }
}

const getlecturesbycourseid=async(req,res,next)=>
{
    try
    {
        const {id}=req.params;
        const Course=await course.findById(id);
        if(!Course)
        {
            return next(new apperror("no course found",400));
        }

        res.status(200).json(
            {
                succes:true,
                message:"course lectures fetched succesfully",
                lectures:Course.lectures,
            }
        )
    }catch(e)
    {
        return next(new apperror(e.message,400));
    }
}

const createcourse=async(req,res,next)=>
{
    const {title,description,category,createdby}=req.body;

    if(!title || !description || !category || !createdby)
    {
        return next(new apperror('all fields are required',400));
    }

    const Course=await course.create(
        {
            title,
            description,
            category,
            createdby,
            thumbnail:
            {
                public_id:'dummy',
                secure_url:'dummy',
            }
        }
    )

    if(!Course)
    {
        return next(new apperror('could not create course',400));
    }

    if(req.file)
    {
        const result=await cloudinary.v2.uploader.upload(req.file.path,
            {
                folder:'lms'
            });
            if(result)
            {
                Course.thumbnail.public_id=result.public_id;
                Course.thumbnail.secure_url=result.secure_url;

            }

            fs.rm(`uploads/${req.file.filename}`);
    }

     await Course.save();
     res.status(200).json(
        {
            success:true,
            message:"course succesfully created",
            Course,
        });
}

const updatecourse=async(req,res,next)=>
{
    try{
        const {id}=req.params;
        const Course=await course.findByIdAndUpdate(
            id,
            {
                $set:req.body
            },
            {
                runValidators:true
            }
        )
        if(!Course)
        {
            return next(new apperror("code with id does not exist",400));
        }
        res.status(200).json(
            {
                success:true,
                message: "course updated sucessfully",
                Course
            }
        )

    }catch(e)
    {
        return next(new apperror(e.message,400));
    }
}



const removecourse=async(req,res,next)=>
{
    try{
        const {id}=req.params;
        const Course =await course.findById(id);
        if(!course)
        {
            return next(new apperror("code with id does not exist",400));
        }

        await Course.deleteOne();

        res.status(200).json(
            {
                success:true,
                message: "course deleted sucessfully",
            }
        )

    }catch(e)
    {
        return next(new apperror(e.message,400));
    }


}


const addlecturebycourseid=async(req,res,next)=>
{
    const {title,description}=req.body;
    const {id}=req.params;

    if(!title || !description)
    {
        return next(new apperror("all fields are required",400));
    }

    const Course=await course.findById(id);

    if(!Course)
    {
        return next(new apperror("course id not valid",400));
    }

    const lecturedata=
    {
        title,
        description,
        lecture:
            {
                public_id:'dummy',
                secure_url:'dummy',
            }

    }

   try{
    if(req.file)
    {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: 'lms', // Save files in a folder named lms
            chunk_size: 50000000, // 50 mb size
            resource_type: 'video',
          });
            if(result)
            {
                lecturedata.lecture.public_id=result.public_id;
                lecturedata.lecture.secure_url=result.secure_url;
            }
            fs.rm(`uploads/${req.file.filename}`);
    }
   }catch(e)
   {
    return next(new apperror(e.message,400));
}

Course.lectures.push(lecturedata);
Course.nooflectures=Course.lectures.length;

await Course.save();
res.status(200).json(
    {
        success:true,
        message:"lecture added succesfully",
        Course
    }
)}


const removelecture=async(req,res,next)=>
{
  const { courseId, lectureId } = req.query;
  console.log(courseId)
  if (!courseId) {
    return next(new apperror('Course ID is required', 400));
  }


  if (!lectureId) {
    return next(new apperror('Lecture ID is required', 400));
  }
  const Course = await course.findById(courseId);
  if (!Course) {
    return next(new apperror('Invalid ID or Course does not exist.', 404));
  }

  const lectureIndex = Course.lectures.findIndex(
    (lecture) => lecture._id.toString() === lectureId.toString()
  );

  if (lectureIndex === -1) {
    return next(new apperror('Lecture does not exist.', 404));
  }

  await cloudinary.v2.uploader.destroy(
    Course.lectures[lectureIndex].lecture.public_id,
    {
      resource_type: 'video',
    }
  );

  // Remove the lecture from the array
  Course.lectures.splice(lectureIndex, 1);

  // update the number of lectures based on lectres array length
  Course.nooflectures = Course.lectures.length;

  // Save the course object
  await Course.save();

  // Return response
  res.status(200).json({
    success: true,
    message: 'Course lecture removed successfully',
  });

}

export{
    getallcourses,
    getlecturesbycourseid,
    createcourse,
    updatecourse,
    removecourse,
    addlecturebycourseid,
    removelecture
}