import { Injectable } from '@angular/core';

import * as Phaser from 'phaser/dist/phaser';

let personagens = [];
let numHitsTerminar;

@Injectable()
export class AnimacaoService {

  readonly SCENE_PRINCIPAL = 'principal';
  readonly WIDTH  = 400;
  readonly HEIGHT = 200;

  readonly P_FADA_VERMELHA = 'fada-vermelha';
  readonly P_ELFO_VERDE    = 'elfo-verde';
  readonly P_ELFO_AZUL     = 'elfo-azul';
  readonly P_ARQUEIRA      = 'arqueira';

  private game: Phaser.Game;

  iniciarAnimacao(jogadores: string[], hitsTerminar: number) {
  	console.log(jogadores);
  	personagens = jogadores;
  	numHitsTerminar = hitsTerminar;
  	this.game = new Phaser.Game({
	    type: Phaser.AUTO,
	    width: this.WIDTH,
	    height: this.HEIGHT, // 550(total) - 200(Jogo) = 350(Principal)
	    scene: {
	    	key: this.SCENE_PRINCIPAL,
	        preload: this.preload,
	        create: this.create,
	        update: this.update
	    }
	  });
  	console.log(this.game);
  }

  preload() {
  	const scene: Phaser.Scene = this;
  	console.log(scene);
  	const backgrounds = [
  		'assets/backgrounds/background1.png',
  		'assets/backgrounds/background2.png',
  		'assets/backgrounds/background3.png',
  		'assets/backgrounds/background4.png'
  	];
  	const backgroundIndex = Math.floor(
  		Math.random() * backgrounds.length);

  	scene.load.image('background', backgrounds[backgroundIndex]);
  	scene.load.audioSprite('attack', 'assets/audios/attack.mp3');
  	scene.load.audioSprite('end', 'assets/audios/end.wav');
  	scene.load.atlas(
  		'fada-vermelha',
  		'assets/sprites/spritesheet-fada-vermelha.png', 
  		'assets/sprites/sprites-fada-vermelha.json'
  	);
  	scene.load.atlas(
  		'elfo-verde',
  		'assets/sprites/spritesheet-elfo-verde.png', 
  		'assets/sprites/sprites-elfo-verde.json'
  	);
  	scene.load.atlas(
  		'elfo-azul',
  		'assets/sprites/spritesheet-elfo-azul.png', 
  		'assets/sprites/sprites-elfo-azul.json'
  	);
  	scene.load.atlas(
  		'arqueira',
  		'assets/sprites/spritesheet-arqueira.png', 
  		'assets/sprites/sprites-arqueira.json'
  	);

  	scene.score = [{ 
  			jogador1: { 
  				pontos: 150, 
  				forca: Math.ceil(150 / numHitsTerminar) 
  			}}, { 
  			jogador2: { 
  				pontos: 150, 
  				forca: Math.ceil(150 / numHitsTerminar) 
  			}
  		}
  	];
  }

  create() {
  	const scene: Phaser.Scene = this;
  	scene.add.image(0, 0, 'background').setOrigin(0, 0).setAlpha(0.7);
  	scene.sound.add('attack');
  	scene.sound.add('end');

	for (let i = 0; i < personagens.length; i++) {
		const oponenteIndex = (i == 0) ? 1 : 0;
		// IDLE - Descanso
		const framesIdle = scene.anims.generateFrameNames(
			personagens[i], { end: 4, zeroPad: 3,prefix: '1_IDLE_'});
		scene.anims.create({
		    key: 'idle-' + personagens[i],
		    frames: framesIdle,
		    frameRate: 8,
		    repeat: -1,
		    onStart: (sprite) => { 
		    	sprite.originX = 0.5;
	  			sprite.originY = 0.5;
		    }
		});
		// ATTACK - Ataque
		const framesAttack = scene.anims.generateFrameNames(
			personagens[i], { end: 4, zeroPad: 3,prefix: '2_ATTACK_'});
		scene.anims.create({
		    key: 'attack-' + personagens[i],
		    frames: framesAttack,
		    frameRate: 8,
		    repeat: 0,
		    onStart: (sprite) => {
		  		sprite.originX = 0.25;
			},
		    onComplete: (sprite) => {
		    	const scene: Phaser.Scene = this;
		    	scene.sound.play('attack');
		    	sprite.play('idle-' + personagens[i]);
		    	if (sprite.scaleX > 0) {
		    		const jogador2 = scene.children.list.filter(sprite => 
	  					(sprite instanceof Phaser.GameObjects.Sprite 
	  					&& sprite.scaleX < 0))[0];
		    		scene.score[1].jogador2.pontos -= scene.score[0].jogador1.forca;
		    		if (scene.score[1].jogador2.pontos <= 0) {
		    			jogador2.play('die-' + personagens[oponenteIndex]);
		    		} else {
		    			jogador2.play('hurt-' + personagens[oponenteIndex]);
		    		}
		    	} else {
		    		const jogador1 = scene.children.list.filter(sprite => 
	  					(sprite instanceof Phaser.GameObjects.Sprite 
	  					&& sprite.scaleX > 0))[0];
		    		scene.score[0].jogador1.pontos -= scene.score[1].jogador2.forca;
		    		if (scene.score[0].jogador1.pontos <= 0) {
		    			jogador1.play('die-' + personagens[oponenteIndex]);
		    		} else {
		    			jogador1.play('hurt-' + personagens[oponenteIndex]);
		    		}
		    	}
			}
		});
		// HURT - Atacado
		const framesHurt = scene.anims.generateFrameNames(
			personagens[i], { end: 4, zeroPad: 3,prefix: '3_HURT_'});
		scene.anims.create({
		    key: 'hurt-' + personagens[i],
		    frames: framesHurt,
		    frameRate: 8,
		    repeat: 0,
		    onStart: (sprite) => {
		  		sprite.originX = 0.6;
			},
		    onComplete: (sprite) => {
		  		sprite.play('idle-' + personagens[i]);
			}
		});
		// DIE - Morte
		const framesDie = scene.anims.generateFrameNames(
			personagens[i], { end: 4, zeroPad: 3,prefix: '4_DIE_'});
		scene.anims.create({
		    key: 'die-' + personagens[i],
		    frames: framesDie,
		    frameRate: 8,
		    repeat: 0,
		    onComplete: () => {
		    	const scene: Phaser.Scene = this;
		    	scene.sound.play('end');
			}
		});
	}

	const jogador1 = scene.add.sprite(90, 110, personagens[0]);
	jogador1.play('idle-' + personagens[0]);

	const jogador2 = scene.add.sprite(310, 110, personagens[1]);
	jogador2.scaleX *= -1;
	jogador2.play('idle-' + personagens[1]);

	const graphics = scene.add.graphics({ 
		lineStyle: { width: 1, color: 0x000000 }, 
		fillStyle: { color: 0x00FF00 } 
	});
  }

  update() {
  	const scene: Phaser.Scene = this;
  	const pontosJog1 = scene.score[0].jogador1.pontos;
	const pontosJog2 = scene.score[1].jogador2.pontos;

  	const graphics = scene.children.list.filter(
  		child => child instanceof Phaser.GameObjects.Graphics)[0];

	graphics.clear();

	// x, y, width, height
	graphics.fillRectShape(new Phaser.Geom.Rectangle(
		10, 10, ((pontosJog1 >= 0) ? pontosJog1 : 0), 12
	));

	graphics.strokeRectShape(
		new Phaser.Geom.Rectangle(10, 10, 150, 12));

	graphics.fillRectShape(new Phaser.Geom.Rectangle(
		(240 + (150 - pontosJog2)), 10, 
		((pontosJog2 >= 0) ? pontosJog2 : 0), 12));

	graphics.strokeRectShape(
		new Phaser.Geom.Rectangle(240, 10, 150, 12));
  }

  atacar(jogador: number) {
  	const jogador1 = this.obterJogador1();
  	const jogador2 = this.obterJogador2();
  	
  	if (jogador == 1) {
	  	jogador1.depth = 2;
	  	jogador2.depth = 1;
	  	jogador1.play('attack-' + personagens[0]);
	} else {
		jogador1.depth = 1;
	  	jogador2.depth = 2;
	  	jogador2.play('attack-' + personagens[1]);
	}
  }

  obterJogador1(): Phaser.GameObjects.Sprite {
  	return this.game
  		.scene
  		.getScene(this.SCENE_PRINCIPAL)
		.children
		.list
		.filter(sprite => this.ehJogador1(sprite))[0];
  }

  obterJogador2(): Phaser.GameObjects.Sprite {
  	return this.game
  		.scene
  		.getScene(this.SCENE_PRINCIPAL)
		.children
		.list
		.filter(sprite => this.ehJogador2(sprite))[0];
  }

  ehJogador1(sprite: any): boolean {
  	return (sprite instanceof Phaser.GameObjects.Sprite 
  				&& sprite.scaleX > 0);
  }

  ehJogador2(sprite: any): boolean {
  	return (sprite instanceof Phaser.GameObjects.Sprite 
  				&& sprite.scaleX < 0);
  }

}