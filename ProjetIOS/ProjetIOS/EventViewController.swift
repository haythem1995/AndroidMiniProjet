//
//  EventViewController.swift
//  ProjetIOS
//
//  Created by Yafet Shil on 21/11/2019.
//  Copyright © 2019 4SIM4. All rights reserved.
//

import UIKit
import Alamofire
import SwiftyJSON

class EventViewController: UIViewController, UITableViewDelegate, UITableViewDataSource{
    
    
    var arr_event_name = [String]()
    var arr_event_id = [String]()
    var arr_event_lieux = [String]()
    var arr_event_distance = [String]()
    var arr_event_type = [String]()
    var arr_event_datedebut = [String]()
    var arr_event_description = [String]()
    let defaults = UserDefaults.standard

    var nom:String?
    
    
    
    
    @IBOutlet weak var eventTableview: UITableView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupTableViewBackgroundView()
        
        self.eventTableview.delegate = self
        self.eventTableview.dataSource = self
        let myapiurl = "http://localhost:1337/evenement/show"
        Alamofire.request(myapiurl, method: .get).responseJSON { (myresponse) in
            switch myresponse.result{
            case .success:
                print(myresponse.result)
                let myresult = try? JSON(data: myresponse.data!)
                print(myresult!["evenements"])
                
                let resultArray = myresult!["evenements"]
                
                self.arr_event_id.removeAll()
                self.arr_event_name.removeAll()
                self.arr_event_lieux.removeAll()
                self.arr_event_distance.removeAll()
                self.arr_event_type.removeAll()
                self.arr_event_description.removeAll()
                
                
                
                
                
                for i in resultArray.arrayValue {
                    //                    print(i)
                    let event_id = i["id_evenement"].stringValue
                    self.arr_event_id.append(event_id)
                    let event_name = i["nom_evenement"].stringValue
                    self.arr_event_name.append(event_name)
                    let event_lieux = i["lieux_evenement"].stringValue
                    self.arr_event_lieux.append(event_lieux)
                    let event_distance = i["distance_evenement"].stringValue
                    self.arr_event_distance.append(event_distance)
                    let event_type = i["type_evenement"].stringValue
                    self.arr_event_type.append(event_type)
                    let event_date_debut = i["date_debut_evenement"].stringValue
                    self.arr_event_datedebut.append(event_date_debut)
                    let event_description = i["description_evenement"].stringValue
                    self.arr_event_description.append(event_description)
                    
                }
                self.eventTableview.reloadData()
                break
                
            case .failure:
                print(myresponse.error!)
                break
            }
        }
        
        // Do any additional setup after loading the view.
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return arr_event_id.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = eventTableview.dequeueReusableCell(withIdentifier: "eventCell")
        let contentView = cell?.viewWithTag(0)
        let eventId = contentView?.viewWithTag(4) as! UILabel
        
        let eventName = contentView?.viewWithTag(1) as! UILabel
        
        let eventDate = contentView?.viewWithTag(2) as! UILabel
        let eventDescription = contentView?.viewWithTag(3) as! UITextView
        eventId.text = arr_event_id[indexPath.row]
        //        let idEvent = eventId.text
        //        self.defaults.set(idEvent, forKey: "event_id")
        //        print(defaults.integer(forKey: "event_id"))
        eventName.text = arr_event_name[indexPath.row]
        eventDate.text = arr_event_datedebut[indexPath.row]
        eventDescription.text = arr_event_description[indexPath.row]
        
        
        return cell!
    }
    private func setupTableViewBackgroundView() {
        let backgroundViewLabel = UILabel(frame: .zero)
        backgroundViewLabel.textColor = .darkGray
        backgroundViewLabel.numberOfLines = 0
        backgroundViewLabel.text = " Oops, No results to show "
        backgroundViewLabel.textAlignment = NSTextAlignment.center
        backgroundViewLabel.font.withSize(20)
        eventTableview.backgroundView = backgroundViewLabel
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        performSegue(withIdentifier: "toEventDetails", sender: indexPath)
        
    }
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {

        if(segue.identifier == "toEventDetails"){
            
        
        let indexPath = sender as! IndexPath

        let indice = indexPath.row

        let eventId = arr_event_id[indice]
        print("event clicked \(eventId)")
        self.defaults.set(eventId, forKey: "event_id")


        //        let imgCandidat = imagesCandidats[indice]

        let detailsViewController = segue.destination as! EventDetailsViewController

        //        detailsViewController.img = imgCandidat

        detailsViewController.idEvent = eventId

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
