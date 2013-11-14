/**
 * 
 */
package org.model.interfaces;

import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * @author Tamás
 *
 */
@Entity
@Table(name = "Task")
public abstract class AbstractTask {

	@Id
	protected String title;
	protected String shortDescription;
	@Embedded
	protected AbstractConcreteTask cTask;
	
	
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getShortDescription() {
		return shortDescription;
	}
	public void setShortDescription(String description) {
		this.shortDescription = description;
	}
	public AbstractConcreteTask getConcreteTask() {
		return cTask;
	}
	public void setConcreteTask(AbstractConcreteTask cTask) {
		this.cTask = cTask;
	}
	
}
