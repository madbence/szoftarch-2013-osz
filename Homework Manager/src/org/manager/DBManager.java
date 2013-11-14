/**
 * 
 */
package org.manager;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.EntityTransaction;
import javax.persistence.Persistence;

/**
 * @author Tamás
 *
 */
public class DBManager {

	private final EntityManagerFactory emf;
	private final EntityManager em;
	private EntityTransaction tx;
	
	public DBManager() {
		
		emf = Persistence.createEntityManagerFactory("Homework Manager");
		em = emf.createEntityManager();
		tx = em.getTransaction();
	
	}
	
	public void persistObject(Object param) {
		tx.begin();
		em.persist(param);
		try {
			tx.commit();
		}
		catch(Exception e) {
			tx.rollback();
		}
	}
	
	public void closeDBConn() {
		em.close();
		emf.close();
	}
	
	public EntityManager getEntityManager() {
		return em;
	}
	
}
