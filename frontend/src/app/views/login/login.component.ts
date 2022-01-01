import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router, private authService:AuthService) { }

  ngOnInit(): void {
  }

  login(){
    this.authService.login().subscribe(
      (x) => {
        // Handle success
        console.log("token",x);
        
        this.router.navigate(["/home"])
      },
      (err) => {
        // Handle error
        alert(err)
      }
    );
    
  //  this.router.navigate(["/home"])
  }
}
