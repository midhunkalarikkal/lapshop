const Brand = require('../models/brandModel')
const fs = require('fs')
const path = require('path')

//To get the brands page
const getAdminBrands = async(req,res)=>{
    try{
        const brandData = await Brand.find()
        return res.render('admin/adminBrandsList',{ brand : brandData })
    }catch(error){
        return res.redirect('/admin/adminErrorPage')
    }
}

//To add new brand
const adminAddNewBrand = async(req,res)=>{
    try{
        const { brandName } = req.body

        if(!brandName){
            return res.status(400).json({ success : false, message: "No brand found." })
        }

        if(!req.file){
            return res.status(400).json({ success : false, message: "No image found." })
        }

        const existbrand = await Brand.findOne({
            name: { $regex: new RegExp(`^${brandName}$`, "i") }
        });
        
        if (existbrand) {
            const newImage = req.file.filename
            const imagePath = path.join(__dirname, "/static/images/BrandImages", newImage);
            fs.unlinkSync(imagePath);
            return res.status(400).json({ success : false, message : "Brand already exist" })
        }else{
            const newBrand = new Brand({
                name: brandName,
                image: req.file.filename
            });
            const savedBrand = await newBrand.save();
            if(savedBrand){
                return res.status(200).json({ success : true, message: "Brand addedd successfully" });
            }else{
                return res.status(500).json({ success : false, message: "Brand adding falied." });
            }
        } 
    }catch(error){
        return res.redirect('/admin/adminErrorPage')
    }
}

//To block and unblock a brand
const adminBlockBrand = async(req,res)=>{
    try {
        const brandId = req.params.brandId;
        if (!brandId) {
            return res.status(400).json({ success: false, message: "BrandId not provided." });
        }

        const brand = await Brand.findById({_id : req.params.brandId});

        if (!brand) {
            return res.status(400).json({ success: false, message: "Brand not found." });
        } else {
            brand.isBlocked = req.body.blockStatus === 'block';
            const saveBrand = await brand.save();
            if(saveBrand){
                return res.status(200).json({ success: true , message: "Block status updated successfully." });
            }else{
                return res.status(500).json({ success: false , message: "Block status updated error." });
            }
        }
    } catch (error) {
        return res.redirect('/admin/adminErrorPage')
    }
}

//To edit brand from brand list page
const adminEditBrand = async(req,res)=>{
    try{
        const brand = await Brand.findOne({_id : req.params.brandId})
        return res.render('admin/adminEditBrand',{ brand })
    }catch(error){
        return res.redirect('/admin/adminErrorPage')
    }
}

//To update the edited brand
const adminUpdateBrand = async(req,res)=>{
    try {
        const { brandName , brandId } = req.body;
        if(!brandName){
            return res.status(400).json({ success : false, message : "Brandname not provided" });
        }
        if(!brandId){
            return res.status(400).json({ success : false, message : "BrandId not found" });
        }
        
        const existingBrand = await Brand.findById(brandId);
        if (!existingBrand) {
            return res.status(400).json({ success : false, message : "Brand not found" });
        }else{
            const oldImageFilename = existingBrand.image;

            if (req.file){
                existingBrand.image = req.file.filename;
                const imagePath = path.join(__dirname, "/static/images/BrandImages", oldImageFilename);
                fs.unlinkSync(imagePath);
            }
            existingBrand.name = brandName;
            const saveBrand = await existingBrand.save();
            if(saveBrand){
                return res.status(200).json({ success : true, message : "Brand updated successfully." });
            }else{
                return res.status(500).json({ success : false, message : "Brand updating failed." });
            }
        }
    }catch(error) {
        return res.redirect('/admin/adminErrorPage')
    }
}

module.exports = {
    getAdminBrands,
    adminAddNewBrand,
    adminBlockBrand,
    adminEditBrand,
    adminUpdateBrand
}