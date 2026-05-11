DELETE FROM "Items" ;
DELETE FROM "Users" ;
DELETE FROM "ItemTypes" ;
DELETE FROM "SpecialToCategory" ;
DELETE FROM "WeaponIDToWeapon"  ;
DELETE FROM "RestrictionType" ;

INSERT INTO "WeaponIDToWeapon"( "WeaponID", "Weapon") VALUES
	  ( 1, 'glock18'),
  	  ( 2, 'hkp2000'),
	  ( 3, 'usp_silencer'), 
	  ( 4, 'dualberettas'),
  	  ( 5, 'p250'),
	  ( 6, 'fiveseven'),
	  ( 7, 'tec9'),
  	  ( 8, 'cz75a'),
	  ( 9, 'deagle'),
	  ( 10, 'r8'),
  	  ( 11, 'mac10'),
	  ( 12, 'mp9'),
	  ( 13, 'mp7'),
  	  ( 14, 'mp5sd'),
	  ( 15, 'ump45'),
	  ( 16, 'p90'),
  	  ( 17, 'ppbizon'),
	  ( 18, 'nova'),
	  ( 19, 'xm1014'),
	  ( 20, 'unused'),
  	  ( 21, 'sawedoff'),
	  ( 22, 'mag7'),
	  ( 23, 'm249'),
  	  ( 24, 'negev'),
	  ( 25, 'galilar'),
	  ( 26, 'famas'),
  	  ( 27, 'ak47'),
	  ( 28, 'm4a1'),
	  ( 29, 'm4a1_silencer'),
  	  ( 30, 'ssg08'),
	  ( 31, 'sg556'),
	  ( 32, 'aug'),
  	  ( 33, 'awp'),
	  ( 34, 'g3sg1'),
	  ( 35, 'scar20'),
  	  ( 36, 'zeus27'),
	  ( 37, 'bayonet'),
	  ( 38, 'm9bayonet'),
  	  ( 39, 'karambit'),
	  ( 40, 'gutNew'),
	  ( 41, 'gut'),
	  ( 42, 'flip'),
  	  ( 43, 'huntsman'),
	  ( 44, 'butterfly'), 
	  ( 45, 'falchion'),
  	  ( 46, 'shadowdaggers'),
	  ( 47, 'bowie'),
	  ( 48, 'talon'),
  	  ( 49, 'ursus'),
	  ( 50, 'navaja'),
	  ( 51, 'stiletto'),
  	  ( 52, 'classic'),
	  ( 53, 'skeleton'),
	  ( 54, 'nomad'),
  	  ( 55, 'survival'),
	  ( 56, 'paracord'),
	  ( 57, 'kukri') ;

INSERT INTO "ItemTypes" (  "TypeID", "Description") VALUES
  ( 1,'Weapon'),
  ( 2,'Sticker'),
  ( 3,'Container'),
  ( 4,'Keychain') ;

INSERT INTO "SpecialToCategory"( "SpecialID", "Category") VALUES
	  ( 1,'Normal'),
	  ( 2,'Stattrak'),
	  ( 3,'Souvenir'),
	  ( 4,'Highlight') ;

INSERT INTO "RestrictionType"( "ID", "RestDescription") VALUES
	  ( 0, 'Not Resrcicted'),
	  ( 1, 'Restricted'), 
	  ( 2, 'Banned') ;	  
INSERT INTO "Users" ( "ID", "Username", "Balance", "email", "password_hash" ) VALUES

  ( 1,'Admin', 100000, 'admin@mail.test', '$2b$10$gyDppwffUtglQvamoS5JJ.RsVaM.isdqUZFk4fxa9eoq1nh.xZsvO' ) ;

	  