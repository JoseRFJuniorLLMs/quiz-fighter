import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  public cadastro: boolean;

  constructor(
  	public afAuth: AngularFireAuth,
  	private router: Router,
  	private fb: FormBuilder, 
    private snackBar: MatSnackBar) {}

  ngOnInit() {
  	this.cadastro = false;
  	this.gerarForm();
  }

  gerarForm() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  logarGoogle() {
    this.afAuth.auth.signInWithPopup(
      new firebase.auth.GoogleAuthProvider())
      .then(value => this.router.navigate(['/jogo']))
      .catch(err => {
        console.log('Erro:', err.message);
        this.snackBar.open('Problema ao autenticar no Google.', 
        	"Erro", { duration: 5000 });
      });
  }

  logarEmail() {
  	if (this.form.invalid) {
      return;
    }
    const dados = this.form.value;
    this.afAuth.auth
      .signInWithEmailAndPassword(dados.email, dados.senha)
      .then(value => this.router.navigate(['/jogo']))
      .catch(err => {
        console.log('Erro: ', err.message);
        this.snackBar.open("Usuário/senha inválido(s)", 
        	"Erro", { duration: 5000 });
      });
  }

  exibirCadastro() {
  	this.cadastro = true;
  }

  exibirLogin() {
  	this.cadastro = false;
  }

  cadastrarEmail() {
  	if (this.form.invalid) {
      return;
    }
    const dados = this.form.value;
  	this.afAuth.auth.createUserAndRetrieveDataWithEmailAndPassword(
  	  dados.email, dados.senha)
  	  .then(value => this.router.navigate(['/jogo']))
  	  .catch(err => {
        console.log('Erro: ', err.message);
        this.snackBar.open("Problema ao cadastrar email.", 
        	"Erro", { duration: 5000 });
      });
  }

  sair() {
    this.afAuth.auth.signOut();
  }

}