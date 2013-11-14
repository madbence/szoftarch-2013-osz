szoftarch-2013-osz
==================

Megírtam az üzleti logikát + DB kapcsolatot.
Külön package-be vannak az interfészek/absztrakt osztályok és a megvalósításuk. 
Minden osztálynak csináltam interfészt, hogy rugalmas legyen a kód. Az oztályok nem olyan komplikáltak, az igazi logika a 
 Tanár, a Diák és a Csoport osztályokban vannak, a többi csak az adat típusát reprezentálja.

Az adatbázis kapcsolatot nem teszteltem, mert nem akartam most felrkani a MySQL-t, de elvileg jól van bekonfigolva és az 
annotációk is remélem, bár nem vagyok 100% az egy-több kapcsolatok esetében.
