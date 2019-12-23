//
//  ProfileViewController.swift
//  ProjetIOS
//
//  Created by Yafet Shil on 07/12/2019.
//  Copyright © 2019 4SIM4. All rights reserved.
//

import UIKit
import Alamofire
import SwiftyJSON

class ProfileViewController: UIViewController,UIImagePickerControllerDelegate,UINavigationControllerDelegate {
    
    @IBOutlet weak var nomtf: UITextField!
    @IBOutlet weak var customToolbar: UIToolbar!
    @IBOutlet weak var prenomtf: UITextField!
    @IBOutlet weak var mailtf: UITextField!
    @IBOutlet weak var telephonetf: UITextField!
    
    
    @IBOutlet weak var profileImage: UIImageView!
    @IBOutlet weak var cameraButton: UIImageView!
    let imagePicker = UIImagePickerController()
    let defaults = UserDefaults.standard
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.navigationItem.setHidesBackButton(true, animated:true)
        
        imagePicker.delegate = self
        nomtf.text = defaults.object(forKey: "user_name") as? String
        prenomtf.text = defaults.object(forKey: "user_prenom") as? String
        mailtf.text = defaults.object(forKey: "user_mail") as? String
        telephonetf.text = defaults.object(forKey: "user_phone") as? String
        
        
        
        
        // Do any additional setup after loading the view.
    }
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
        if let image = info[UIImagePickerController.InfoKey.originalImage] as? UIImage {
            profileImage.image = image
            imagePicker.dismiss(animated: true, completion: nil)
        } else {
            print("There is an error picking the image")
        }
    }
    
    @IBAction func cameraTapped(_ sender: Any) {
        imagePicker.sourceType = .savedPhotosAlbum
        imagePicker.allowsEditing = true
        present(imagePicker, animated: true, completion: nil)
        
        
    }
    
    
    
    @IBAction func update_btn(_ sender: Any) {
        let connectedUserId =  defaults.integer(forKey: "user_id")
        print(connectedUserId)
        let serverUrl = "http://localhost:1337/user/edit/\(connectedUserId)"
        
        guard let email = mailtf.text, !email.isEmpty else {return}
        guard let nom = nomtf.text, !nom.isEmpty else {return}
        guard let prenom = prenomtf.text, !prenom.isEmpty else {return}
        guard let telephone = telephonetf.text, !telephone.isEmpty else {return}
        
        let updateRequest = [
            "name" : nom,
            "email" : email,
            "prenom" : prenom,
            "tel_user" : telephone,
        ]
        
        print(updateRequest)
        
        
        
        Alamofire.request(serverUrl, method: .put, parameters: updateRequest, encoding: JSONEncoding.default, headers: nil).responseString { (responseObject) -> Void in
            if responseObject.result.isSuccess {
                let resJson = JSON(responseObject.result.value!)
                print(resJson)
                
                if (resJson == "Porifle modifié avec succés")
                {
                    let myalert = UIAlertController(title: "MERCI", message: "Vos données sont modifiés avec succés", preferredStyle: UIAlertController.Style.alert)
                    
                    myalert.addAction(UIAlertAction(title: "OK", style: .default) { (action:UIAlertAction!) in
                    })
                    self.present(myalert, animated: true)
                }
         
                
                
            }
            if responseObject.result.isFailure {
                let error : Error = responseObject.result.error!
                print(error)
            }
            
            
        }
    }
    
    
    /*
     // MARK: - Navigation
     
     // In a storyboard-based application, you will often want to do a little preparation before navigation
     override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
     // Get the new view controller using segue.destination.
     // Pass the selected object to the new view controller.
     }
     */
    
}
