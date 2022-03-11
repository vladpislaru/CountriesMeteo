Tehnologiile folosite au fost :

- CRUD API : nodejs cu framework express
- mongoDB: Baza de date
- mongoExpress: Utilitar pentru baza de date

In cadrul aplicatiei am definit 3 functii auxiliare pentru a parsa rezultatele de la baza de date in formatul corect:
Pentru update si add s-au verificat atat potrivirea id-ului din parametrii cu cel din body cat si existenta unor parametrii in body care nu ar trebui sa existe:
In cazul stergerii unei tari s-a realizat(mongo nu permite stergerea in cascada precum bazele de date sql ) :
1.Identificarea oraselor asociate tarii
2.Stergerea tutror teperaturilor asociate fiecarui oras
3.Stergerea oraselor indetificare
4.Stergerea prorpiu zisa a tarii
Aceeasi procedura si pentru stergerea unei tari : - se sterg intai temperaturile asociate apoi orasul
In cazul parametrilor from si until in caz ca acestia nu existau am initial valorile lor cu 2 date care ar incadra toate temperaturile:
