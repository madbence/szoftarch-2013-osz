/**
 * 
 */
package org.model.interfaces;

/**
 * @author Tamás
 *
 */
public abstract class Person {

	protected String name;
	protected String email;
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	
	
}
